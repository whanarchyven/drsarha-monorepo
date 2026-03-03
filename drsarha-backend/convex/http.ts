import { httpRouter } from "convex/server";
import { getTaskConditionHttp, getClinicTaskQuestionConditionHttp } from "./functions/clinic_tasks";
import { initHelpConversationHttp } from "./functions/drsarha_help_conversations";

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

export default http;
