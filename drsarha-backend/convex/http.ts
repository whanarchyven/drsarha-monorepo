import { httpRouter } from "convex/server";
import { getTaskConditionHttp, getClinicTaskQuestionConditionHttp } from "./functions/clinic_tasks";
import {
  extractUserInsightsHttp,
  getQuestionInfoHttp,
  getQuestionInsightsHttp,
  getQuestionSummaryHttp,
} from "./functions/analytic_pipeline";
import {
  fillCompaniesHttp,
  getBySlugInfoHttp,
  verifyCompanyPasswordHttp,
} from "./functions/companies";
import {
  getCompanySlugsByGroupSlugHttp,
  verifyGroupPasswordHttp,
} from "./functions/company_groups";
import {
  approveConferenceUserHttp,
  countConferenceUsersHttpAction,
  registerConferenceUserHttp,
} from "./functions/conference_users";
import {
  markConferencePromocodePayedHttp,
  validateConferencePromocode,
} from "./functions/conference_promocodes";
import { initHelpConversationHttp } from "./functions/drsarha_help_conversations";
import { createPaymentHttp } from "./functions/payments";
import { getPinsSummaryHttp } from "./functions/pins";

const http = httpRouter();

http.route({
  path: "/clinic-tasks/condition",
  method: "GET",
  handler: getTaskConditionHttp,
});

http.route({
  path: "/clinic-tasks/question-condition",
  method: "GET",
  handler: getClinicTaskQuestionConditionHttp,
});

http.route({
  path: "/help-conversations/init",
  method: "POST",
  handler: initHelpConversationHttp,
});

http.route({
  path: "/conference-user/register",
  method: "POST",
  handler: registerConferenceUserHttp,
});

http.route({
  path: "/conference-user/approve",
  method: "POST",
  handler: approveConferenceUserHttp,
});

http.route({
  path: "/conference-users/approve",
  method: "POST",
  handler: approveConferenceUserHttp,
});

http.route({
  path: "/payments/create",
  method: "POST",
  handler: createPaymentHttp,
});

http.route({
  path: "/pins/summary",
  method: "GET",
  handler: getPinsSummaryHttp,
});

http.route({
  path: "/conference-users/count",
  method: "GET",
  handler: countConferenceUsersHttpAction,
});

http.route({
  path: "/conference-promocodes/validate",
  method: "POST",
  handler: validateConferencePromocode,
});

http.route({
  path: "/conference-promocodes/mark-payed",
  method: "POST",
  handler: markConferencePromocodePayedHttp,
});

http.route({
  path: "/analytics/insights/extract",
  method: "POST",
  handler: extractUserInsightsHttp,
});

http.route({
  path: "/analytics/questions/summary",
  method: "GET",
  handler: getQuestionSummaryHttp,
});

http.route({
  path: "/analytics/questions/insights",
  method: "GET",
  handler: getQuestionInsightsHttp,
});

http.route({
  path: "/analytics/questions/info",
  method: "GET",
  handler: getQuestionInfoHttp,
});

http.route({
  path: "/insight-results/summary-by-insight-question-id",
  method: "GET",
  handler: getQuestionSummaryHttp,
});

http.route({
  path: "/companies/fill",
  method: "POST",
  handler: fillCompaniesHttp,
});

http.route({
  path: "/companies/get-by-slug-info",
  method: "GET",
  handler: getBySlugInfoHttp,
});

http.route({
  path: "/companies/get-by-slug",
  method: "GET",
  handler: getBySlugInfoHttp,
});

http.route({
  path: "/companies/verify-password",
  method: "POST",
  handler: verifyCompanyPasswordHttp,
});

http.route({
  path: "/company-groups/by-slug",
  method: "GET",
  handler: getCompanySlugsByGroupSlugHttp,
});

http.route({
  path: "/company-groups/company-slugs",
  method: "GET",
  handler: getCompanySlugsByGroupSlugHttp,
});

http.route({
  path: "/company-groups/verify-password",
  method: "POST",
  handler: verifyGroupPasswordHttp,
});

http.route({
  path: "/company-groups/verify-group-password",
  method: "POST",
  handler: verifyGroupPasswordHttp,
});

export default http;
