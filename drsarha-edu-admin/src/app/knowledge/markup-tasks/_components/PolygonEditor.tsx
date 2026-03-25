'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { getContentUrl } from '@/shared/utils/url';

export interface MarkupTaskPointDraft {
  x: number;
  y: number;
}

export interface MarkupTaskElementDraft {
  id?: string;
  name?: string;
  description?: string;
  geometry: {
    type: string;
    points: MarkupTaskPointDraft[];
  };
  basis: number;
  fine: number;
  reward: number;
  enable_cheating: boolean;
  order: number;
  isClosed?: boolean;
}

interface PolygonEditorProps {
  image: string | File | null;
  elements: MarkupTaskElementDraft[];
  onChange: (elements: MarkupTaskElementDraft[]) => void;
  defaultColor?: string;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const SVG_SIZE = 1000;

const toSvgValue = (value: number) => value * SVG_SIZE;
const toSvgPoints = (points: MarkupTaskPointDraft[]) =>
  points
    .map((point) => `${toSvgValue(point.x)},${toSvgValue(point.y)}`)
    .join(' ');

const reorderElements = (elements: MarkupTaskElementDraft[]) =>
  elements.map((element, index) => ({
    ...element,
    order: index,
  }));

const getStrokeColor = (_index: number, fallback?: string) =>
  fallback || '#ef4444';

const emptyContour = (order: number): MarkupTaskElementDraft => ({
  geometry: { type: 'polygon', points: [] },
  basis: 0,
  fine: 0,
  reward: 0,
  enable_cheating: false,
  order,
  name: '',
  description: '',
  isClosed: false,
});

export function PolygonEditor({
  image,
  elements,
  onChange,
  defaultColor,
}: PolygonEditorProps) {
  const [activeContourIndex, setActiveContourIndex] = useState<number>(0);
  const [dragging, setDragging] = useState<{
    contourIndex: number;
    pointIndex: number;
  } | null>(null);
  const [cursorPoint, setCursorPoint] = useState<MarkupTaskPointDraft | null>(
    null
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!image) return '';
    if (typeof image === 'string') return getContentUrl(image);
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    if (!elements.length) {
      setActiveContourIndex(0);
      return;
    }

    if (activeContourIndex > elements.length - 1) {
      setActiveContourIndex(elements.length - 1);
    }
  }, [activeContourIndex, elements.length]);

  useEffect(() => {
    if (!image || typeof image === 'string') return;
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [image, previewUrl]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = clamp((event.clientX - rect.left) / rect.width);
      const y = clamp((event.clientY - rect.top) / rect.height);

      onChange(
        elements.map((element, contourIndex) => {
          if (contourIndex !== dragging.contourIndex) return element;

          return {
            ...element,
            geometry: {
              ...element.geometry,
              points: element.geometry.points.map((point, pointIndex) =>
                pointIndex === dragging.pointIndex ? { x, y } : point
              ),
            },
          };
        })
      );
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, elements, onChange]);

  const activeContour = elements[activeContourIndex];
  const activePreviewPoints =
    activeContour && !activeContour.isClosed && cursorPoint
      ? [...activeContour.geometry.points, cursorPoint]
      : [];

  const updateContour = (
    contourIndex: number,
    updater: (element: MarkupTaskElementDraft) => MarkupTaskElementDraft
  ) => {
    onChange(
      elements.map((element, index) =>
        index === contourIndex ? updater(element) : element
      )
    );
  };

  const addContour = () => {
    const nextElements = [...elements, emptyContour(elements.length)];
    onChange(nextElements);
    setActiveContourIndex(nextElements.length - 1);
  };

  const deleteContour = (contourIndex: number) => {
    const nextElements = reorderElements(
      elements.filter((_, index) => index !== contourIndex)
    );
    onChange(nextElements);
    setActiveContourIndex(Math.max(0, contourIndex - 1));
  };

  const undoLastPoint = () => {
    if (!activeContour) return;

    updateContour(activeContourIndex, (element) => ({
      ...element,
      geometry: {
        ...element.geometry,
        points: element.geometry.points.slice(0, -1),
      },
      isClosed: false,
    }));
  };

  const moveContour = (contourIndex: number, direction: -1 | 1) => {
    const targetIndex = contourIndex + direction;
    if (targetIndex < 0 || targetIndex >= elements.length) return;

    const nextElements = [...elements];
    const temp = nextElements[contourIndex];
    nextElements[contourIndex] = nextElements[targetIndex];
    nextElements[targetIndex] = temp;

    onChange(reorderElements(nextElements));
    setActiveContourIndex(targetIndex);
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!activeContour) return;
    if (activeContour.isClosed) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width);
    const y = clamp((event.clientY - rect.top) / rect.height);

    const points = activeContour.geometry.points;
    if (points.length >= 3) {
      const firstPoint = points[0];
      const firstX = firstPoint.x * rect.width;
      const firstY = firstPoint.y * rect.height;
      const distance = Math.hypot(
        event.clientX - rect.left - firstX,
        event.clientY - rect.top - firstY
      );

      if (distance <= 12) {
        updateContour(activeContourIndex, (element) => ({
          ...element,
          isClosed: true,
        }));
        return;
      }
    }

    updateContour(activeContourIndex, (element) => ({
      ...element,
      geometry: {
        ...element.geometry,
        points: [...element.geometry.points, { x, y }],
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Контуров: {elements.length}</Badge>
        {activeContour && (
          <Badge variant={activeContour.isClosed ? 'default' : 'secondary'}>
            {activeContour.isClosed ? 'Контур замкнут' : 'Контур открыт'}
          </Badge>
        )}
      </div>

      <Card className="p-3 lg:p-4">
        {!previewUrl ? (
          <div className="rounded-md border border-dashed p-8 text-sm text-muted-foreground">
            Сначала загрузите изображение слайда.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Клик по изображению добавляет точку. Клик рядом с первой точкой
                замыкает контур. Линия предпросмотра показывает следующее ребро.
              </div>
              <div
                ref={wrapperRef}
                className="relative w-full overflow-hidden rounded-md border bg-black/5">
                <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 bg-background/90"
                    onClick={undoLastPoint}
                    disabled={!activeContour?.geometry.points.length}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 bg-background/90"
                    onClick={addContour}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Slide preview"
                  className="block w-full h-auto"
                />
                <svg
                  className="absolute inset-0 h-full w-full cursor-crosshair"
                  viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                  preserveAspectRatio="none"
                  onClick={handleCanvasClick}
                  onMouseMove={(event) => {
                    if (!activeContour || activeContour.isClosed) {
                      setCursorPoint(null);
                      return;
                    }
                    const rect = event.currentTarget.getBoundingClientRect();
                    setCursorPoint({
                      x: clamp((event.clientX - rect.left) / rect.width),
                      y: clamp((event.clientY - rect.top) / rect.height),
                    });
                  }}
                  onMouseLeave={() => setCursorPoint(null)}>
                  {elements.map((element, contourIndex) => {
                    const points = toSvgPoints(element.geometry.points);
                    const stroke = getStrokeColor(contourIndex, defaultColor);

                    return (
                      <g key={element.id ?? `contour-${contourIndex}`}>
                        {element.isClosed &&
                          element.geometry.points.length >= 3 && (
                            <polygon
                              points={points}
                              fill={stroke}
                              fillOpacity={0.25}
                              stroke={stroke}
                              strokeWidth={
                                activeContourIndex === contourIndex ? 3 : 2
                              }
                              onMouseDown={(mouseEvent) => {
                                mouseEvent.stopPropagation();
                                setActiveContourIndex(contourIndex);
                              }}
                            />
                          )}

                        <polyline
                          points={points}
                          fill="none"
                          stroke={stroke}
                          strokeOpacity={0.95}
                          strokeWidth={
                            activeContourIndex === contourIndex ? 3 : 2
                          }
                          onMouseDown={(mouseEvent) => {
                            mouseEvent.stopPropagation();
                            setActiveContourIndex(contourIndex);
                          }}
                        />

                        {element.geometry.points.map((point, pointIndex) => (
                          <circle
                            key={`${contourIndex}-${pointIndex}`}
                            cx={toSvgValue(point.x)}
                            cy={toSvgValue(point.y)}
                            r={activeContourIndex === contourIndex ? 8 : 6}
                            fill={stroke}
                            stroke="#fff"
                            strokeWidth={2}
                            onMouseDown={(mouseEvent) => {
                              mouseEvent.stopPropagation();
                              setActiveContourIndex(contourIndex);
                              setDragging({ contourIndex, pointIndex });
                            }}
                          />
                        ))}
                      </g>
                    );
                  })}

                  {activePreviewPoints.length >= 2 && (
                    <polyline
                      points={toSvgPoints(activePreviewPoints)}
                      fill="none"
                      stroke={getStrokeColor(activeContourIndex, defaultColor)}
                      strokeDasharray="8 6"
                      strokeWidth={2}
                      strokeOpacity={0.95}
                      pointerEvents="none"
                    />
                  )}

                  {!!activeContour?.geometry.points[0] &&
                    !activeContour.isClosed && (
                      <circle
                        cx={toSvgValue(activeContour.geometry.points[0].x)}
                        cy={toSvgValue(activeContour.geometry.points[0].y)}
                        r={12}
                        fill="transparent"
                        stroke={getStrokeColor(
                          activeContourIndex,
                          defaultColor
                        )}
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    )}
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                {elements.map((element, contourIndex) => (
                  <Card
                    key={element.id ?? `contour-card-${contourIndex}`}
                    className={`space-y-3 p-3 ${
                      contourIndex === activeContourIndex
                        ? 'border-primary'
                        : ''
                    }`}
                    onClick={() => setActiveContourIndex(contourIndex)}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            contourIndex === activeContourIndex
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => setActiveContourIndex(contourIndex)}>
                          Контур {contourIndex + 1}
                        </Button>
                        <Badge variant="outline">
                          Точек: {element.geometry.points.length}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveContour(contourIndex, -1)}>
                          Вверх
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveContour(contourIndex, 1)}>
                          Вниз
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteContour(contourIndex)}>
                          Удалить
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Название элемента
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Короткое имя зоны, которое поможет отличать контуры.
                        </p>
                        <Input
                          value={element.name ?? ''}
                          onChange={(event) =>
                            updateContour(contourIndex, (item) => ({
                              ...item,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Название элемента"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Описание элемента
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Пояснение, что именно должен отметить пользователь.
                        </p>
                        <Textarea
                          value={element.description ?? ''}
                          onChange={(event) =>
                            updateContour(contourIndex, (item) => ({
                              ...item,
                              description: event.target.value,
                            }))
                          }
                          placeholder="Описание элемента"
                          className="min-h-20"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Basis</div>
                          <p className="text-xs text-muted-foreground">
                            Базовый вес или балл элемента.
                          </p>
                          <Input
                            type="number"
                            value={element.basis}
                            onChange={(event) =>
                              updateContour(contourIndex, (item) => ({
                                ...item,
                                basis: Number(event.target.value || 0),
                              }))
                            }
                            placeholder="Basis"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Fine</div>
                          <p className="text-xs text-muted-foreground">
                            Штраф за ошибку на этом элементе.
                          </p>
                          <Input
                            type="number"
                            value={element.fine}
                            onChange={(event) =>
                              updateContour(contourIndex, (item) => ({
                                ...item,
                                fine: Number(event.target.value || 0),
                              }))
                            }
                            placeholder="Fine"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Reward</div>
                          <p className="text-xs text-muted-foreground">
                            Награда за правильную разметку.
                          </p>
                          <Input
                            type="number"
                            value={element.reward}
                            onChange={(event) =>
                              updateContour(contourIndex, (item) => ({
                                ...item,
                                reward: Number(event.target.value || 0),
                              }))
                            }
                            placeholder="Reward"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={element.enable_cheating}
                          onCheckedChange={(checked) =>
                            updateContour(contourIndex, (item) => ({
                              ...item,
                              enable_cheating: Boolean(checked),
                            }))
                          }
                        />
                        Разрешить cheating
                      </label>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateContour(contourIndex, (item) => ({
                            ...item,
                            isClosed:
                              element.geometry.points.length >= 3
                                ? !item.isClosed
                                : false,
                          }))
                        }
                        disabled={element.geometry.points.length < 3}>
                        {element.isClosed ? 'Разомкнуть' : 'Замкнуть'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
