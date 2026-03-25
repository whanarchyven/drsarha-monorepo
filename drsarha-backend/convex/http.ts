import { httpRouter } from "convex/server";
import { getTaskConditionHttp, getClinicTaskQuestionConditionHttp } from "./functions/clinic_tasks";
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

export default http;
