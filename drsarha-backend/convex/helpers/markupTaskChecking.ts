import * as polygonClipping from "polygon-clipping";

export interface MarkupTaskPointLike {
  x: number;
  y: number;
}

export interface MarkupTaskGeometryLike {
  type: string;
  points: MarkupTaskPointLike[];
}

export interface SubmittedMarkupContour {
  markup_task_slide_id: string;
  geometry: MarkupTaskGeometryLike;
  use_basis?: boolean;
}

export interface TaskElementForCheck {
  _id: string;
  markup_task_slide_id: string;
  geometry: MarkupTaskGeometryLike;
  basis: number;
  fine: number;
  reward: number;
  enable_cheating: boolean;
}

export interface MarkupTaskMatchResult {
  contour_index: number;
  element_id: string;
  markup_task_slide_id: string;
  use_basis: boolean;
  awarded_score: number;
  overlap_ratio: number;
  area_ratio: number;
}

export interface MarkupTaskScoreResult {
  completed: boolean;
  score: number;
  scorePercent: number;
  maxScore: number;
  guessedElementIds: string[];
  missedElementIds: string[];
  ignoredCheatElementIds: string[];
  matches: MarkupTaskMatchResult[];
}

type Ring = number[][];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

const closeRing = (points: MarkupTaskPointLike[]): Ring => {
  const ring = points.map((point) => [point.x, point.y]);
  if (ring.length === 0) {
    return ring;
  }
  const [firstX, firstY] = ring[0];
  const [lastX, lastY] = ring[ring.length - 1];
  if (firstX !== lastX || firstY !== lastY) {
    ring.push([firstX, firstY]);
  }
  return ring;
};

const ringArea = (ring: Ring) => {
  if (ring.length < 4) {
    return 0;
  }
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
};

const polygonArea = (polygon: Polygon) => {
  if (polygon.length === 0) {
    return 0;
  }
  const [outerRing, ...holes] = polygon;
  return Math.max(
    ringArea(outerRing) - holes.reduce((sum, hole) => sum + ringArea(hole), 0),
    0
  );
};

const multiPolygonArea = (multiPolygon: MultiPolygon | null | undefined) => {
  if (!multiPolygon || multiPolygon.length === 0) {
    return 0;
  }
  return multiPolygon.reduce((sum, polygon) => sum + polygonArea(polygon), 0);
};

export const isValidMarkupPolygon = (geometry: MarkupTaskGeometryLike) =>
  geometry.type === "polygon" && Array.isArray(geometry.points) && geometry.points.length >= 3;

export const geometryArea = (geometry: MarkupTaskGeometryLike) => {
  if (!isValidMarkupPolygon(geometry)) {
    return 0;
  }
  return ringArea(closeRing(geometry.points));
};

const toPolygon = (geometry: MarkupTaskGeometryLike): Polygon => [closeRing(geometry.points)];

export const getIntersectionArea = (
  first: MarkupTaskGeometryLike,
  second: MarkupTaskGeometryLike
) => {
  if (!isValidMarkupPolygon(first) || !isValidMarkupPolygon(second)) {
    return 0;
  }

  const result = polygonClipping.intersection(
    toPolygon(first),
    toPolygon(second)
  ) as MultiPolygon | null;

  return multiPolygonArea(result);
};

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
};

export const scoreMarkupContours = ({
  conturs,
  taskElements,
  cheatedElementIds,
}: {
  conturs: SubmittedMarkupContour[];
  taskElements: TaskElementForCheck[];
  cheatedElementIds: string[];
}): MarkupTaskScoreResult => {
  const cheatedSet = new Set(cheatedElementIds.map(String));
  const activeElements = taskElements.filter(
    (element) =>
      !cheatedSet.has(String(element._id)) && isValidMarkupPolygon(element.geometry)
  );
  const guessedSet = new Set<string>();
  const matches: MarkupTaskMatchResult[] = [];

  for (let contourIndex = 0; contourIndex < conturs.length; contourIndex += 1) {
    const contour = conturs[contourIndex];
    if (!isValidMarkupPolygon(contour.geometry)) {
      continue;
    }

    const contourArea = geometryArea(contour.geometry);
    if (contourArea <= 0) {
      continue;
    }

    const sameSlideElements = activeElements.filter(
      (element) =>
        String(element.markup_task_slide_id) === String(contour.markup_task_slide_id) &&
        !guessedSet.has(String(element._id))
    );

    for (const element of sameSlideElements) {
      const elementArea = geometryArea(element.geometry);
      if (elementArea <= 0) {
        continue;
      }

      const intersectionArea = getIntersectionArea(contour.geometry, element.geometry);
      const overlapRatio = intersectionArea / elementArea;
      const areaRatio = elementArea / contourArea;

      if (overlapRatio > 0.7 && areaRatio >= 0.85) {
        const awardedScore = contour.use_basis === true ? element.basis : element.reward;
        guessedSet.add(String(element._id));
        matches.push({
          contour_index: contourIndex,
          element_id: String(element._id),
          markup_task_slide_id: String(element.markup_task_slide_id),
          use_basis: contour.use_basis === true,
          awarded_score: awardedScore,
          overlap_ratio: overlapRatio,
          area_ratio: areaRatio,
        });
      }
    }
  }

  const guessedElementIds = [...guessedSet];
  const missedElements = activeElements.filter(
    (element) => !guessedSet.has(String(element._id))
  );
  const missedElementIds = missedElements.map((element) => String(element._id));

  const positiveScore = matches.reduce(
    (sum, match) => sum + match.awarded_score,
    0
  );
  const negativeScore = missedElements.reduce(
    (sum, element) => sum + element.fine,
    0
  );
  const score = positiveScore - negativeScore;
  const maxScore = activeElements.reduce((sum, element) => sum + element.reward, 0);
  const scorePercent =
    maxScore <= 0 ? 100 : clampPercent((score / maxScore) * 100);

  return {
    completed: maxScore <= 0 ? true : scorePercent >= 70,
    score,
    scorePercent,
    maxScore,
    guessedElementIds,
    missedElementIds,
    ignoredCheatElementIds: [...cheatedSet],
    matches,
  };
};

export const pickRandomCheatElement = (
  taskElements: TaskElementForCheck[],
  cheatedElementIds: string[]
) => {
  const cheatedSet = new Set(cheatedElementIds.map(String));
  const candidates = taskElements.filter(
    (element) =>
      element.enable_cheating && !cheatedSet.has(String(element._id))
  );

  if (candidates.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? null;
};
