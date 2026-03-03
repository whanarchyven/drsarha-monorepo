/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_admin_users from "../functions/admin_users.js";
import type * as functions_admin_users_actions from "../functions/admin_users_actions.js";
import type * as functions_ai_verifications from "../functions/ai_verifications.js";
import type * as functions_auth from "../functions/auth.js";
import type * as functions_brochures from "../functions/brochures.js";
import type * as functions_categories from "../functions/categories.js";
import type * as functions_clinic_atlases from "../functions/clinic_atlases.js";
import type * as functions_clinic_tasks from "../functions/clinic_tasks.js";
import type * as functions_collaboration_requests from "../functions/collaboration_requests.js";
import type * as functions_companies from "../functions/companies.js";
import type * as functions_drsarha_education_conversations from "../functions/drsarha_education_conversations.js";
import type * as functions_drsarha_help_conversations from "../functions/drsarha_help_conversations.js";
import type * as functions_folders from "../functions/folders.js";
import type * as functions_help_tickets from "../functions/help_tickets.js";
import type * as functions_interactive_matches from "../functions/interactive_matches.js";
import type * as functions_interactive_quizzes from "../functions/interactive_quizzes.js";
import type * as functions_interactive_tasks from "../functions/interactive_tasks.js";
import type * as functions_lections from "../functions/lections.js";
import type * as functions_lootbox_claims from "../functions/lootbox_claims.js";
import type * as functions_lootboxes from "../functions/lootboxes.js";
import type * as functions_migration from "../functions/migration.js";
import type * as functions_notifications from "../functions/notifications.js";
import type * as functions_nozologies from "../functions/nozologies.js";
import type * as functions_payments from "../functions/payments.js";
import type * as functions_pin_comment_reports from "../functions/pin_comment_reports.js";
import type * as functions_pin_comments from "../functions/pin_comments.js";
import type * as functions_pin_likes from "../functions/pin_likes.js";
import type * as functions_pin_reports from "../functions/pin_reports.js";
import type * as functions_pin_tags from "../functions/pin_tags.js";
import type * as functions_pins from "../functions/pins.js";
import type * as functions_prize_claims from "../functions/prize_claims.js";
import type * as functions_prizes from "../functions/prizes.js";
import type * as functions_progress from "../functions/progress.js";
import type * as functions_ratings from "../functions/ratings.js";
import type * as functions_references from "../functions/references.js";
import type * as functions_task_groups from "../functions/task_groups.js";
import type * as functions_tasks from "../functions/tasks.js";
import type * as functions_transactions from "../functions/transactions.js";
import type * as functions_user_bans from "../functions/user_bans.js";
import type * as functions_user_completions from "../functions/user_completions.js";
import type * as functions_user_saved_knowledge from "../functions/user_saved_knowledge.js";
import type * as functions_user_saved_pins from "../functions/user_saved_pins.js";
import type * as functions_users from "../functions/users.js";
import type * as helpers_s3 from "../helpers/s3.js";
import type * as helpers_upload from "../helpers/upload.js";
import type * as http from "../http.js";
import type * as models_adminUser from "../models/adminUser.js";
import type * as models_aiVerification from "../models/aiVerification.js";
import type * as models_brochure from "../models/brochure.js";
import type * as models_category from "../models/category.js";
import type * as models_clinicAtlas from "../models/clinicAtlas.js";
import type * as models_clinicTask from "../models/clinicTask.js";
import type * as models_collaborationRequest from "../models/collaborationRequest.js";
import type * as models_company from "../models/company.js";
import type * as models_educationConversation from "../models/educationConversation.js";
import type * as models_folder from "../models/folder.js";
import type * as models_groupProgress from "../models/groupProgress.js";
import type * as models_helpConversation from "../models/helpConversation.js";
import type * as models_helpTicket from "../models/helpTicket.js";
import type * as models_interactiveMatch from "../models/interactiveMatch.js";
import type * as models_interactiveQuiz from "../models/interactiveQuiz.js";
import type * as models_interactiveTask from "../models/interactiveTask.js";
import type * as models_lection from "../models/lection.js";
import type * as models_lootbox from "../models/lootbox.js";
import type * as models_lootboxClaim from "../models/lootboxClaim.js";
import type * as models_notification from "../models/notification.js";
import type * as models_nozology from "../models/nozology.js";
import type * as models_payment from "../models/payment.js";
import type * as models_pin from "../models/pin.js";
import type * as models_pinCommentReport from "../models/pinCommentReport.js";
import type * as models_pinReport from "../models/pinReport.js";
import type * as models_pinReportType from "../models/pinReportType.js";
import type * as models_pinTag from "../models/pinTag.js";
import type * as models_prize from "../models/prize.js";
import type * as models_prizeClaim from "../models/prizeClaim.js";
import type * as models_task from "../models/task.js";
import type * as models_taskGroup from "../models/taskGroup.js";
import type * as models_taskProgress from "../models/taskProgress.js";
import type * as models_transactions from "../models/transactions.js";
import type * as models_user from "../models/user.js";
import type * as models_userBan from "../models/userBan.js";
import type * as models_userCompletion from "../models/userCompletion.js";
import type * as models_userLevel from "../models/userLevel.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/admin_users": typeof functions_admin_users;
  "functions/admin_users_actions": typeof functions_admin_users_actions;
  "functions/ai_verifications": typeof functions_ai_verifications;
  "functions/auth": typeof functions_auth;
  "functions/brochures": typeof functions_brochures;
  "functions/categories": typeof functions_categories;
  "functions/clinic_atlases": typeof functions_clinic_atlases;
  "functions/clinic_tasks": typeof functions_clinic_tasks;
  "functions/collaboration_requests": typeof functions_collaboration_requests;
  "functions/companies": typeof functions_companies;
  "functions/drsarha_education_conversations": typeof functions_drsarha_education_conversations;
  "functions/drsarha_help_conversations": typeof functions_drsarha_help_conversations;
  "functions/folders": typeof functions_folders;
  "functions/help_tickets": typeof functions_help_tickets;
  "functions/interactive_matches": typeof functions_interactive_matches;
  "functions/interactive_quizzes": typeof functions_interactive_quizzes;
  "functions/interactive_tasks": typeof functions_interactive_tasks;
  "functions/lections": typeof functions_lections;
  "functions/lootbox_claims": typeof functions_lootbox_claims;
  "functions/lootboxes": typeof functions_lootboxes;
  "functions/migration": typeof functions_migration;
  "functions/notifications": typeof functions_notifications;
  "functions/nozologies": typeof functions_nozologies;
  "functions/payments": typeof functions_payments;
  "functions/pin_comment_reports": typeof functions_pin_comment_reports;
  "functions/pin_comments": typeof functions_pin_comments;
  "functions/pin_likes": typeof functions_pin_likes;
  "functions/pin_reports": typeof functions_pin_reports;
  "functions/pin_tags": typeof functions_pin_tags;
  "functions/pins": typeof functions_pins;
  "functions/prize_claims": typeof functions_prize_claims;
  "functions/prizes": typeof functions_prizes;
  "functions/progress": typeof functions_progress;
  "functions/ratings": typeof functions_ratings;
  "functions/references": typeof functions_references;
  "functions/task_groups": typeof functions_task_groups;
  "functions/tasks": typeof functions_tasks;
  "functions/transactions": typeof functions_transactions;
  "functions/user_bans": typeof functions_user_bans;
  "functions/user_completions": typeof functions_user_completions;
  "functions/user_saved_knowledge": typeof functions_user_saved_knowledge;
  "functions/user_saved_pins": typeof functions_user_saved_pins;
  "functions/users": typeof functions_users;
  "helpers/s3": typeof helpers_s3;
  "helpers/upload": typeof helpers_upload;
  http: typeof http;
  "models/adminUser": typeof models_adminUser;
  "models/aiVerification": typeof models_aiVerification;
  "models/brochure": typeof models_brochure;
  "models/category": typeof models_category;
  "models/clinicAtlas": typeof models_clinicAtlas;
  "models/clinicTask": typeof models_clinicTask;
  "models/collaborationRequest": typeof models_collaborationRequest;
  "models/company": typeof models_company;
  "models/educationConversation": typeof models_educationConversation;
  "models/folder": typeof models_folder;
  "models/groupProgress": typeof models_groupProgress;
  "models/helpConversation": typeof models_helpConversation;
  "models/helpTicket": typeof models_helpTicket;
  "models/interactiveMatch": typeof models_interactiveMatch;
  "models/interactiveQuiz": typeof models_interactiveQuiz;
  "models/interactiveTask": typeof models_interactiveTask;
  "models/lection": typeof models_lection;
  "models/lootbox": typeof models_lootbox;
  "models/lootboxClaim": typeof models_lootboxClaim;
  "models/notification": typeof models_notification;
  "models/nozology": typeof models_nozology;
  "models/payment": typeof models_payment;
  "models/pin": typeof models_pin;
  "models/pinCommentReport": typeof models_pinCommentReport;
  "models/pinReport": typeof models_pinReport;
  "models/pinReportType": typeof models_pinReportType;
  "models/pinTag": typeof models_pinTag;
  "models/prize": typeof models_prize;
  "models/prizeClaim": typeof models_prizeClaim;
  "models/task": typeof models_task;
  "models/taskGroup": typeof models_taskGroup;
  "models/taskProgress": typeof models_taskProgress;
  "models/transactions": typeof models_transactions;
  "models/user": typeof models_user;
  "models/userBan": typeof models_userBan;
  "models/userCompletion": typeof models_userCompletion;
  "models/userLevel": typeof models_userLevel;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
