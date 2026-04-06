import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Strict tables from models
import { brochuresTable } from "./models/brochure";
import { nozologiesTable } from "./models/nozology";
import { categoriesTable } from "./models/category";
import { lectionsTable } from "./models/lection";
import { interactiveTasksTable } from "./models/interactiveTask";
import { interactiveQuizzesTable } from "./models/interactiveQuiz";
import { interactiveMatchesTable } from "./models/interactiveMatch";
import { clinicTasksTable } from "./models/clinicTask";
import { educationConversationsTable } from "./models/educationConversation";
import { helpConversationsTable } from "./models/helpConversation";
import { companiesTable } from "./models/company";
import { pinTagsTable } from "./models/pinTag";
import { prizesTable } from "./models/prize";
import { usersTable } from "./models/user";
import { lootboxesTable } from "./models/lootbox";
import { lootboxClaimsTable } from "./models/lootboxClaim";
import { prizeClaimsTable } from "./models/prizeClaim";
import { paymentsTable } from "./models/payment";
import { notificationsTable } from "./models/notification";
import { taskGroupsTable } from "./models/taskGroup";
import { tasksTable } from "./models/task";
import { taskProgressTable } from "./models/taskProgress";
import { groupProgressTable } from "./models/groupProgress";
import { userLevelsTable } from "./models/userLevel";
import { starsTransactionsTable, expTransactionsTable } from "./models/transactions";
import { pinReportTypesTable } from "./models/pinReportType";
import { pinReportsTable } from "./models/pinReport";
import { pinCommentReportsTable } from "./models/pinCommentReport";
import { pinsTable, pinLikesTable, pinCommentsTable, userSavedPinsTable } from "./models/pin";
import { userBansTable } from "./models/userBan";
import { userCompletionsTable } from "./models/userCompletion";
import { clinicAtlasesTestTable } from "./models/clinicAtlas";
import { adminUsersTable } from "./models/adminUser";
import { foldersTable, folderCollaboratorsTable, savedPinsTable } from "./models/folder";
import { collaborationRequestsTable } from "./models/collaborationRequest";
import { aiVerificationsTable } from "./models/aiVerification";
import { helpTicketsTable } from "./models/helpTicket";
import { markupTasksTable } from "./models/markupTask";
import { markupTaskStagesTable } from "./models/markupTaskStage";
import { markupTaskSlidesTable } from "./models/markupTaskSlide";
import { markupTaskElementsTable } from "./models/markupTaskElement";
import { analyticQuestionsTable } from "./models/analyticQuestion";
import { analyticInsightsTable } from "./models/analyticInsight";
import { analyticRewritesTable } from "./models/analyticRewrite";
import { conferenceUsersTable } from "./models/conferenceUser";
import { conferenceBroadcastTable } from "./models/conferenceBroadcast";
import { conferenceAiTextTable } from "./models/conferenceAiText";
import { conferenceEmailLogTable } from "./models/conferenceEmailLog";
import { conferenceGeneratedAudioTable } from "./models/conferenceGeneratedAudio";
import { conferenceClickerBattleTable } from "./models/conferenceClickerBattle";
import { conferencePromocodesTable } from "./models/conferencePromocode";
import {
  conferenceChatMessagesTable,
  conferenceChatReactionsTable,
} from "./models/conferenceChat";
import {
  conferenceInteractivesTable,
  conferenceInteractiveResponsesTable,
} from "./models/conferenceInteractive";

// ⚠️ ВРЕМЕННО: Отключена валидация схемы для миграции
// После завершения миграции и rewrite_links верните строгие валидаторы
// Установите MIGRATION_MODE=false чтобы вернуть валидацию
const MIGRATION_MODE = false; // Измените на false после миграции

export default defineSchema({
  // Strictly typed tables (или v.any() если MIGRATION_MODE=true)
  brochures: MIGRATION_MODE ? defineTable(v.any()) : brochuresTable,
  nozologies: MIGRATION_MODE ? defineTable(v.any()) : nozologiesTable,
  categories: MIGRATION_MODE ? defineTable(v.any()) : categoriesTable,
  lections: MIGRATION_MODE ? defineTable(v.any()) : lectionsTable,
  interactive_tasks: MIGRATION_MODE ? defineTable(v.any()) : interactiveTasksTable,
  interactive_quizzes: MIGRATION_MODE ? defineTable(v.any()) : interactiveQuizzesTable,
  interactive_matches: MIGRATION_MODE ? defineTable(v.any()) : interactiveMatchesTable,
  clinic_tasks: MIGRATION_MODE ? defineTable(v.any()) : clinicTasksTable,
  drsarha_education_conversations: MIGRATION_MODE ? defineTable(v.any()) : educationConversationsTable,
  drsarha_help_conversations: MIGRATION_MODE ? defineTable(v.any()) : helpConversationsTable,
  companies: MIGRATION_MODE ? defineTable(v.any()) : companiesTable,
  pin_tags: MIGRATION_MODE ? defineTable(v.any()) : pinTagsTable,
  prizes: MIGRATION_MODE ? defineTable(v.any()) : prizesTable,
  users: MIGRATION_MODE ? defineTable(v.any()) : usersTable,
  lootboxes: MIGRATION_MODE ? defineTable(v.any()) : lootboxesTable,
  lootbox_claims: MIGRATION_MODE ? defineTable(v.any()) : lootboxClaimsTable,
  prize_claims: MIGRATION_MODE ? defineTable(v.any()) : prizeClaimsTable,
  payments: MIGRATION_MODE ? defineTable(v.any()) : paymentsTable,
  notifications: MIGRATION_MODE ? defineTable(v.any()) : notificationsTable,
  task_groups: MIGRATION_MODE ? defineTable(v.any()) : taskGroupsTable,
  tasks: MIGRATION_MODE ? defineTable(v.any()) : tasksTable,
  task_progress: MIGRATION_MODE ? defineTable(v.any()) : taskProgressTable,
  group_progress: MIGRATION_MODE ? defineTable(v.any()) : groupProgressTable,
  user_levels: MIGRATION_MODE ? defineTable(v.any()) : userLevelsTable,
  stars_transactions: MIGRATION_MODE ? defineTable(v.any()) : starsTransactionsTable,
  exp_transactions: MIGRATION_MODE ? defineTable(v.any()) : expTransactionsTable,
  pin_report_type: MIGRATION_MODE ? defineTable(v.any()) : pinReportTypesTable,
  pin_reports: MIGRATION_MODE ? defineTable(v.any()) : pinReportsTable,
  pin_comment_reports: MIGRATION_MODE ? defineTable(v.any()) : pinCommentReportsTable,
  pins: MIGRATION_MODE ? defineTable(v.any()) : pinsTable,
  pin_likes: MIGRATION_MODE ? defineTable(v.any()) : pinLikesTable,
  pin_comments: MIGRATION_MODE ? defineTable(v.any()) : pinCommentsTable,
  user_saved_pins: MIGRATION_MODE ? defineTable(v.any()) : userSavedPinsTable,
  user_bans: MIGRATION_MODE ? defineTable(v.any()) : userBansTable,
  user_completions: MIGRATION_MODE ? defineTable(v.any()) : userCompletionsTable,
  admin_users: MIGRATION_MODE ? defineTable(v.any()) : adminUsersTable,
  folders: MIGRATION_MODE ? defineTable(v.any()) : foldersTable,
  folder_collaborators: MIGRATION_MODE ? defineTable(v.any()) : folderCollaboratorsTable,
  saved_pins: MIGRATION_MODE ? defineTable(v.any()) : savedPinsTable,
  collaboration_requests: MIGRATION_MODE ? defineTable(v.any()) : collaborationRequestsTable,
  ai_verifications: MIGRATION_MODE ? defineTable(v.any()) : aiVerificationsTable,
  help_tickets: MIGRATION_MODE ? defineTable(v.any()) : helpTicketsTable,
  markup_tasks: MIGRATION_MODE ? defineTable(v.any()) : markupTasksTable,
  markup_task_stages: MIGRATION_MODE ? defineTable(v.any()) : markupTaskStagesTable,
  markup_task_slides: MIGRATION_MODE ? defineTable(v.any()) : markupTaskSlidesTable,
  markup_task_elements: MIGRATION_MODE ? defineTable(v.any()) : markupTaskElementsTable,
  analytic_questions: MIGRATION_MODE ? defineTable(v.any()) : analyticQuestionsTable,
  analytic_insights: MIGRATION_MODE ? defineTable(v.any()) : analyticInsightsTable,
  analytic_rewrites: MIGRATION_MODE ? defineTable(v.any()) : analyticRewritesTable,
  conference_users: MIGRATION_MODE ? defineTable(v.any()) : conferenceUsersTable,
  conference_broadcast: MIGRATION_MODE ? defineTable(v.any()) : conferenceBroadcastTable,
  conference_ai_text: MIGRATION_MODE ? defineTable(v.any()) : conferenceAiTextTable,
  conference_email_logs: MIGRATION_MODE ? defineTable(v.any()) : conferenceEmailLogTable,
  conference_generated_audio: MIGRATION_MODE
    ? defineTable(v.any())
    : conferenceGeneratedAudioTable,
  conference_clicker_battle: MIGRATION_MODE
    ? defineTable(v.any())
    : conferenceClickerBattleTable,
  conference_promocodes: MIGRATION_MODE ? defineTable(v.any()) : conferencePromocodesTable,
  conference_chat_messages: MIGRATION_MODE ? defineTable(v.any()) : conferenceChatMessagesTable,
  conference_chat_reactions: MIGRATION_MODE ? defineTable(v.any()) : conferenceChatReactionsTable,
  conference_interactives: MIGRATION_MODE ? defineTable(v.any()) : conferenceInteractivesTable,
  conference_interactive_responses: MIGRATION_MODE ? defineTable(v.any()) : conferenceInteractiveResponsesTable,

  // Remaining tables kept loose for now (no dedicated model yet)
  brochures_test: defineTable(v.any()),
  categories_test: defineTable(v.any()),
  clinic_atlases: defineTable(v.any()),
  clinic_atlases_test: clinicAtlasesTestTable,
  comments: defineTable(v.any()),
  comments_test: defineTable(v.any()),
  companies_test: defineTable(v.any()),
  courses: defineTable(v.any()),
  interactive_matches_test: defineTable(v.any()),
  interactive_quizzes_test: defineTable(v.any()),
  interactive_tasks_test: defineTable(v.any()),
  lections_test: defineTable(v.any()),
  nozologies_test: defineTable(v.any()),
  user_saved_knowledge: defineTable(v.any()),
  user_referrals: defineTable(v.any()),
});


