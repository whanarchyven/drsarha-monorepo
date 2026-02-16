import { query } from "../_generated/server";
import { v } from "convex/values";
type DocWithReferences = {
  references?: Array<unknown>;
  name?: string;
  nozology?: string;
  _id: string;
};

const hasEmptyReferences = (doc: DocWithReferences) =>
  !doc.references || doc.references.length === 0;

export const listEmptyReferences = query({
  args: {},
  returns: v.string(),
  handler: async ({ db }) => {
    const brochures = (await db.query("brochures").collect()).filter((doc) =>
      hasEmptyReferences(doc as DocWithReferences),
    );
    const categories = (await db.query("categories").collect()).filter((doc) =>
      hasEmptyReferences(doc as DocWithReferences),
    );
    const clinicTasks = (await db.query("clinic_tasks").collect()).filter((doc) =>
      hasEmptyReferences(doc as DocWithReferences),
    );
    const interactiveTasks = (await db.query("interactive_tasks").collect()).filter((doc) =>
      hasEmptyReferences(doc as DocWithReferences),
    );
    const interactiveQuizzes = (await db.query("interactive_quizzes").collect()).filter((doc) =>
      hasEmptyReferences(doc as DocWithReferences),
    );
    const interactiveMatches = (await db.query("interactive_matches").collect()).filter((doc) =>
      hasEmptyReferences(doc as DocWithReferences),
    );
    const lections = (await db.query("lections").collect()).filter((doc) =>
      hasEmptyReferences(doc as DocWithReferences),
    );

    const formatItems = (items: Array<DocWithReferences>) =>
      items.map((item) => `---- ${item.name ?? item._id}`);

    const nozologies = await db.query("nozologies").collect();
    const nozologyNameById: Record<string, string> = {};
    for (const nozology of nozologies) {
      nozologyNameById[nozology._id] = nozology.name;
    }

    const groups: Record<
      string,
      {
        brochures: Array<DocWithReferences>;
        categories: Array<DocWithReferences>;
        clinicTasks: Array<DocWithReferences>;
        interactiveTasks: Array<DocWithReferences>;
        interactiveQuizzes: Array<DocWithReferences>;
        interactiveMatches: Array<DocWithReferences>;
        lections: Array<DocWithReferences>;
      }
    > = {};

    const resolveNozologyLabel = (nozology?: string) => {
      if (!nozology) return "Без нозологии";
      const name = nozologyNameById[nozology];
      return `Нозология ${name ?? nozology}`;
    };

    const getGroup = (nozology?: string) => {
      const key = resolveNozologyLabel(nozology);
      if (!groups[key]) {
        groups[key] = {
          brochures: [],
          categories: [],
          clinicTasks: [],
          interactiveTasks: [],
          interactiveQuizzes: [],
          interactiveMatches: [],
          lections: [],
        };
      }
      return groups[key];
    };

    for (const doc of brochures as Array<DocWithReferences>) {
      getGroup(doc.nozology).brochures.push(doc);
    }
    for (const doc of clinicTasks as Array<DocWithReferences>) {
      getGroup(doc.nozology).clinicTasks.push(doc);
    }
    for (const doc of interactiveTasks as Array<DocWithReferences>) {
      getGroup(doc.nozology).interactiveTasks.push(doc);
    }
    for (const doc of interactiveQuizzes as Array<DocWithReferences>) {
      getGroup(doc.nozology).interactiveQuizzes.push(doc);
    }
    for (const doc of interactiveMatches as Array<DocWithReferences>) {
      getGroup(doc.nozology).interactiveMatches.push(doc);
    }
    for (const doc of lections as Array<DocWithReferences>) {
      getGroup(doc.nozology).lections.push(doc);
    }
    for (const doc of categories as Array<DocWithReferences>) {
      getGroup().categories.push(doc);
    }

    const sections: string[] = [];
    for (const nozology of Object.keys(groups).sort()) {
      const group = groups[nozology];
      sections.push(`${nozology}:`);
      sections.push("-- Брошюры:");
      sections.push(...formatItems(group.brochures));
      sections.push("-- Категории:");
      sections.push(...formatItems(group.categories));
      sections.push("-- Клинические задачи:");
      sections.push(...formatItems(group.clinicTasks));
      sections.push("-- Интерактивные задачи:");
      sections.push(...formatItems(group.interactiveTasks));
      sections.push("-- Интерактивные квизы:");
      sections.push(...formatItems(group.interactiveQuizzes));
      sections.push("-- Интерактивные матчи:");
      sections.push(...formatItems(group.interactiveMatches));
      sections.push("-- Лекции:");
      sections.push(...formatItems(group.lections));
      sections.push("");
    }

    return sections.join("\n");
  },
});
