import { type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
  functions: {
    task_groups: {
      getAll: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          _creationTime: number;
          _id: Id<"task_groups">;
          createdAt?: string;
          description: string;
          endDate: string;
          isActive: boolean;
          level?: null | number;
          mongoId?: string;
          name: string;
          reward: {
            items: Array<{
              amount: number;
              objectId?: Id<"lootboxes"> | string;
              title: string;
              type: string;
            }>;
          };
          startDate: string;
          timeType: string;
          updatedAt: string;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"task_groups"> },
        {
          _creationTime: number;
          _id: Id<"task_groups">;
          createdAt?: string;
          description: string;
          endDate: string;
          isActive: boolean;
          level?: null | number;
          mongoId?: string;
          name: string;
          reward: {
            items: Array<{
              amount: number;
              objectId?: Id<"lootboxes"> | string;
              title: string;
              type: string;
            }>;
          };
          startDate: string;
          timeType: string;
          updatedAt: string;
        } | null
      >;
      getByTimeTypeAndStartDate: FunctionReference<
        "query",
        "public",
        { startDate: string; timeType: string },
        {
          _creationTime: number;
          _id: Id<"task_groups">;
          createdAt?: string;
          description: string;
          endDate: string;
          isActive: boolean;
          level?: null | number;
          mongoId?: string;
          name: string;
          reward: {
            items: Array<{
              amount: number;
              objectId?: Id<"lootboxes"> | string;
              title: string;
              type: string;
            }>;
          };
          startDate: string;
          timeType: string;
          updatedAt: string;
        } | null
      >;
      getByDate: FunctionReference<
        "query",
        "public",
        { date: string },
        {
          daily: Array<{
            _creationTime: number;
            _id: Id<"task_groups">;
            createdAt?: string;
            description: string;
            endDate: string;
            isActive: boolean;
            level?: null | number;
            mongoId?: string;
            name: string;
            reward: {
              items: Array<{
                amount: number;
                objectId?: Id<"lootboxes"> | string;
                title: string;
                type: string;
              }>;
            };
            startDate: string;
            timeType: string;
            updatedAt: string;
          }>;
          level: Array<{
            _creationTime: number;
            _id: Id<"task_groups">;
            createdAt?: string;
            description: string;
            endDate: string;
            isActive: boolean;
            level?: null | number;
            mongoId?: string;
            name: string;
            reward: {
              items: Array<{
                amount: number;
                objectId?: Id<"lootboxes"> | string;
                title: string;
                type: string;
              }>;
            };
            startDate: string;
            timeType: string;
            updatedAt: string;
          }>;
          weekly: Array<{
            _creationTime: number;
            _id: Id<"task_groups">;
            createdAt?: string;
            description: string;
            endDate: string;
            isActive: boolean;
            level?: null | number;
            mongoId?: string;
            name: string;
            reward: {
              items: Array<{
                amount: number;
                objectId?: Id<"lootboxes"> | string;
                title: string;
                type: string;
              }>;
            };
            startDate: string;
            timeType: string;
            updatedAt: string;
          }>;
        }
      >;
      listActive: FunctionReference<
        "query",
        "public",
        { date?: string; userId?: Id<"users"> | string; userLevel?: number },
        Array<{
          _creationTime: number;
          _id: Id<"task_groups">;
          createdAt?: string;
          description: string;
          endDate: string;
          isActive: boolean;
          level?: null | number;
          mongoId?: string;
          name: string;
          reward: {
            items: Array<{
              amount: number;
              objectId?: Id<"lootboxes"> | string;
              title: string;
              type: string;
            }>;
          };
          startDate: string;
          timeType: string;
          updatedAt: string;
        }>
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          createdAt?: string;
          description: string;
          endDate: string;
          isActive: boolean;
          level?: null | number;
          mongoId?: string;
          name: string;
          reward: {
            items: Array<{
              amount: number;
              objectId?: Id<"lootboxes"> | string;
              title: string;
              type: string;
            }>;
          };
          startDate: string;
          timeType: string;
          updatedAt: string;
        },
        {
          _creationTime: number;
          _id: Id<"task_groups">;
          createdAt?: string;
          description: string;
          endDate: string;
          isActive: boolean;
          level?: null | number;
          mongoId?: string;
          name: string;
          reward: {
            items: Array<{
              amount: number;
              objectId?: Id<"lootboxes"> | string;
              title: string;
              type: string;
            }>;
          };
          startDate: string;
          timeType: string;
          updatedAt: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"task_groups"> },
        boolean
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"task_groups">;
          patch: {
            createdAt?: string;
            description?: string;
            endDate?: string;
            isActive?: boolean;
            level?: null | number;
            mongoId?: string;
            name?: string;
            reward?: {
              items: Array<{
                amount: number;
                objectId?: Id<"lootboxes"> | string;
                title: string;
                type: string;
              }>;
            };
            startDate?: string;
            timeType?: string;
            updatedAt?: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"task_groups">;
          createdAt?: string;
          description: string;
          endDate: string;
          isActive: boolean;
          level?: null | number;
          mongoId?: string;
          name: string;
          reward: {
            items: Array<{
              amount: number;
              objectId?: Id<"lootboxes"> | string;
              title: string;
              type: string;
            }>;
          };
          startDate: string;
          timeType: string;
          updatedAt: string;
        }
      >;
      seedByDateRange: FunctionReference<
        "action",
        "public",
        { endDate: string; startDate: string },
        {
          createdDaily: number;
          createdWeekly: number;
          skippedDaily: number;
          skippedWeekly: number;
        }
      >;
    };
    tasks: {
      getAll: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          _creationTime: number;
          _id: Id<"tasks">;
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"tasks"> },
        {
          _creationTime: number;
          _id: Id<"tasks">;
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        } | null
      >;
      getByIdOrMongoId: FunctionReference<
        "query",
        "public",
        { id: string },
        {
          _creationTime: number;
          _id: Id<"tasks">;
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        } | null
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        },
        {
          _creationTime: number;
          _id: Id<"tasks">;
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        }
      >;
      listActive: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          _creationTime: number;
          _id: Id<"tasks">;
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        }>
      >;
      listByGroup: FunctionReference<
        "query",
        "public",
        { groupId: Id<"task_groups"> },
        Array<{
          _creationTime: number;
          _id: Id<"tasks">;
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        }>
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"tasks"> },
        boolean
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"tasks">;
          patch: {
            actionType?: string;
            config?: {
              knowledgeRef?: null | string;
              knowledgeType?: null | string;
              targetAmount: number;
            };
            createdAt?: string;
            description?: string;
            groupId?: Id<"task_groups"> | string;
            isActive?: boolean;
            mongoId?: string;
            reward?: { exp: number; stars: number };
            title?: string;
            updatedAt?: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"tasks">;
          actionType: string;
          config: {
            knowledgeRef?: null | string;
            knowledgeType?: null | string;
            targetAmount: number;
          };
          createdAt?: string;
          description: string;
          groupId: Id<"task_groups"> | string;
          isActive: boolean;
          mongoId?: string;
          reward: { exp: number; stars: number };
          title: string;
          updatedAt: string;
        }
      >;
      completeTaskDirectly: FunctionReference<
        "action",
        "public",
        { taskId: string; userIds: Array<Id<"users">> },
        { processed: number; success: boolean }
      >;
    };
    transactions: {
      createStars: FunctionReference<
        "mutation",
        "public",
        {
          created_at: string;
          knowledge_id?: string | null;
          mongoId?: string;
          stars: number;
          type?: string;
          user_id: Id<"users"> | string;
        },
        {
          _creationTime: number;
          _id: Id<"stars_transactions">;
          created_at: string;
          knowledge_id?: string | null;
          mongoId?: string;
          stars: number;
          type?: string;
          user_id: Id<"users"> | string;
        }
      >;
      createExp: FunctionReference<
        "mutation",
        "public",
        {
          created_at: string;
          exp: number;
          knowledge_id?: string | null;
          mongoId?: string;
          type: "plus" | "minus";
          user_id: Id<"users"> | string;
        },
        {
          _creationTime: number;
          _id: Id<"exp_transactions">;
          created_at: string;
          exp: number;
          knowledge_id?: string | null;
          mongoId?: string;
          type: "plus" | "minus";
          user_id: Id<"users"> | string;
        }
      >;
      listStarsByUser: FunctionReference<
        "query",
        "public",
        {
          limit?: number;
          page?: number;
          type?: "plus" | "minus";
          userId: Id<"users"> | string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"stars_transactions">;
            created_at: string;
            knowledge_id?: string | null;
            mongoId?: string;
            stars: number;
            type?: string;
            user_id: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      listExpByUser: FunctionReference<
        "query",
        "public",
        {
          limit?: number;
          page?: number;
          type?: "plus" | "minus";
          userId: Id<"users"> | string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"exp_transactions">;
            created_at: string;
            exp: number;
            knowledge_id?: string | null;
            mongoId?: string;
            type: "plus" | "minus";
            user_id: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
    };
    user_completions: {
      create: FunctionReference<
        "mutation",
        "public",
        { knowledge_id: string; type: string; user_id: string },
        {
          _creationTime: number;
          _id: Id<"user_completions">;
          completed_at: null | string;
          created_at: string;
          feedback: Array<{
            created_at: string;
            feedback: Array<{
              analytic_questions?: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
              user_answers?: string | Array<string | Array<string>>;
            }>;
          }>;
          is_completed: boolean;
          knowledge_id: string;
          metadata:
            | null
            | {
                active_time: number;
                notes: Array<{ note: string; time: number }>;
              }
            | Array<{
                attempt: {
                  answers: Array<{
                    answer: string;
                    image?: string;
                    is_correct: boolean;
                    question?: string;
                  }>;
                  is_correct?: boolean;
                };
                created_at: string;
              }>;
          mongoId?: string;
          type: string;
          updated_at: string;
          user_id: string;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"user_completions"> },
        {
          _creationTime: number;
          _id: Id<"user_completions">;
          completed_at: null | string;
          created_at: string;
          feedback: Array<{
            created_at: string;
            feedback: Array<{
              analytic_questions?: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
              user_answers?: string | Array<string | Array<string>>;
            }>;
          }>;
          is_completed: boolean;
          knowledge_id: string;
          metadata:
            | null
            | {
                active_time: number;
                notes: Array<{ note: string; time: number }>;
              }
            | Array<{
                attempt: {
                  answers: Array<{
                    answer: string;
                    image?: string;
                    is_correct: boolean;
                    question?: string;
                  }>;
                  is_correct?: boolean;
                };
                created_at: string;
              }>;
          mongoId?: string;
          type: string;
          updated_at: string;
          user_id: string;
        } | null
      >;
      getByUserAndKnowledge: FunctionReference<
        "query",
        "public",
        { knowledge_id: string; user_id: string },
        {
          _creationTime: number;
          _id: Id<"user_completions">;
          completed_at: null | string;
          created_at: string;
          feedback: Array<{
            created_at: string;
            feedback: Array<{
              analytic_questions?: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
              user_answers?: string | Array<string | Array<string>>;
            }>;
          }>;
          is_completed: boolean;
          knowledge_id: string;
          metadata:
            | null
            | {
                active_time: number;
                notes: Array<{ note: string; time: number }>;
              }
            | Array<{
                attempt: {
                  answers: Array<{
                    answer: string;
                    image?: string;
                    is_correct: boolean;
                    question?: string;
                  }>;
                  is_correct?: boolean;
                };
                created_at: string;
              }>;
          mongoId?: string;
          type: string;
          updated_at: string;
          user_id: string;
        } | null
      >;
      setCompleted: FunctionReference<
        "mutation",
        "public",
        { id: Id<"user_completions"> },
        {
          _creationTime: number;
          _id: Id<"user_completions">;
          completed_at: null | string;
          created_at: string;
          feedback: Array<{
            created_at: string;
            feedback: Array<{
              analytic_questions?: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
              user_answers?: string | Array<string | Array<string>>;
            }>;
          }>;
          is_completed: boolean;
          knowledge_id: string;
          metadata:
            | null
            | {
                active_time: number;
                notes: Array<{ note: string; time: number }>;
              }
            | Array<{
                attempt: {
                  answers: Array<{
                    answer: string;
                    image?: string;
                    is_correct: boolean;
                    question?: string;
                  }>;
                  is_correct?: boolean;
                };
                created_at: string;
              }>;
          mongoId?: string;
          type: string;
          updated_at: string;
          user_id: string;
        }
      >;
      complete: FunctionReference<
        "mutation",
        "public",
        { id: Id<"user_completions"> },
        { message: string; starsTransaction?: any; success: boolean }
      >;
      pushFeedback: FunctionReference<
        "mutation",
        "public",
        {
          feedbackItem: {
            created_at: string;
            feedback: Array<{
              analytic_questions?: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
              user_answers?: string | Array<string>;
            }>;
          };
          id: Id<"user_completions">;
        },
        {
          _creationTime: number;
          _id: Id<"user_completions">;
          completed_at: null | string;
          created_at: string;
          feedback: Array<{
            created_at: string;
            feedback: Array<{
              analytic_questions?: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
              user_answers?: string | Array<string | Array<string>>;
            }>;
          }>;
          is_completed: boolean;
          knowledge_id: string;
          metadata:
            | null
            | {
                active_time: number;
                notes: Array<{ note: string; time: number }>;
              }
            | Array<{
                attempt: {
                  answers: Array<{
                    answer: string;
                    image?: string;
                    is_correct: boolean;
                    question?: string;
                  }>;
                  is_correct?: boolean;
                };
                created_at: string;
              }>;
          mongoId?: string;
          type: string;
          updated_at: string;
          user_id: string;
        }
      >;
      setMetadata: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"user_completions">;
          metadata:
            | null
            | {
                active_time: number;
                notes: Array<{ note: string; time: number }>;
              }
            | Array<{
                attempt: {
                  answers: Array<{
                    answer: string;
                    image?: string;
                    is_correct: boolean;
                    question?: string;
                  }>;
                  is_correct?: boolean;
                };
                created_at: string;
              }>;
        },
        {
          _creationTime: number;
          _id: Id<"user_completions">;
          completed_at: null | string;
          created_at: string;
          feedback: Array<{
            created_at: string;
            feedback: Array<{
              analytic_questions?: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
              user_answers?: string | Array<string | Array<string>>;
            }>;
          }>;
          is_completed: boolean;
          knowledge_id: string;
          metadata:
            | null
            | {
                active_time: number;
                notes: Array<{ note: string; time: number }>;
              }
            | Array<{
                attempt: {
                  answers: Array<{
                    answer: string;
                    image?: string;
                    is_correct: boolean;
                    question?: string;
                  }>;
                  is_correct?: boolean;
                };
                created_at: string;
              }>;
          mongoId?: string;
          type: string;
          updated_at: string;
          user_id: string;
        }
      >;
      getUserIdsByKnowledgeId: FunctionReference<
        "query",
        "public",
        { knowledge_id: string },
        Array<string>
      >;
      getCompletionMetadata: FunctionReference<
        "query",
        "public",
        { knowledge_id: string; user_id: string },
        { metadata: any }
      >;
      getNovelty: FunctionReference<
        "query",
        "public",
        { user_id: string },
        Array<any>
      >;
    };
    user_saved_pins: {
      save: FunctionReference<
        "mutation",
        "public",
        { pinId: string; userId: string },
        {
          _creationTime: number;
          _id: Id<"user_saved_pins">;
          mongoId?: string;
          pinId: Id<"pins"> | string;
          savedAt: string;
          userId: Id<"users"> | string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { pinId: string; userId: string },
        boolean
      >;
      list: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; userId: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"user_saved_pins">;
            mongoId?: string;
            pinId: Id<"pins"> | string;
            savedAt: string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      checkSaved: FunctionReference<
        "query",
        "public",
        { pinIds: Array<string>; userId: string },
        Array<string>
      >;
    };
    users: {
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"users"> },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        } | null
      >;
      getByMongoId: FunctionReference<
        "query",
        "public",
        { mongoId: string },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        } | null
      >;
      getByEmail: FunctionReference<
        "query",
        "public",
        { email: string },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        } | null
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
      setResetCode: FunctionReference<
        "mutation",
        "public",
        { email: string; resetCode: string; resetCodeExpires: string },
        boolean
      >;
      resetPassword: FunctionReference<
        "mutation",
        "public",
        { code: string; email: string; newPasswordHash: string },
        boolean
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"users">;
          patch: {
            address_pool?: Array<string>;
            avatar?: null | string;
            bio?: string;
            birthDate?: string;
            city?: string;
            created_at?: string;
            diploma?: string;
            educationPassed?: boolean;
            email?: string;
            exp?: number;
            fullName?: string;
            gender?: string;
            isApproved?: boolean;
            isCorrect?: boolean;
            isPediatric?: boolean;
            isScientific?: boolean;
            is_banned?: boolean;
            level?: number;
            lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
            metadata?: { description: string; image: string; title: string };
            mongoId?: string;
            name?: string;
            password?: string;
            payments?: Array<{
              _id?: string;
              mongoId?: string;
              payment: {
                amount: { currency: string; value: string };
                confirmation: { confirmation_url: string; type: string };
                created_at: string;
                description: string;
                id: string;
                metadata: Record<string, never>;
                paid: boolean;
                recipient: { account_id: string; gateway_id: string };
                refundable: boolean;
                status: string;
                test: boolean;
              };
              plan: string;
              status: string;
              tariff: string;
              user: {
                _id?: string;
                email?: string;
                fullName?: string;
                mongoId?: string;
                phone?: string;
              };
            }>;
            phone?: string;
            pinId?: string;
            plan?: string;
            position?: string;
            privateClinic?: boolean;
            referalCount?: number;
            refererId?: string;
            resetCode?: string;
            resetCodeExpires?: string;
            saved?: Array<{
              articleUrl: string;
              category?: string;
              publishedDate: string;
              title_translation_human: string;
            }>;
            specialization?: string;
            stars?: number;
            subscribeTill?: string;
            tariff?: string;
            telegram?: string;
            trackingPermission?: boolean;
            updatedAt?: string;
            userId?: string;
            viewed?: Array<{
              articleUrl: string;
              publishedDate: string;
              title_translation_human: string;
            }>;
            workplace?: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
      inc: FunctionReference<
        "mutation",
        "public",
        { exp?: number; id: Id<"users">; stars?: number },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        } | null
      >;
      setStars: FunctionReference<
        "mutation",
        "public",
        { id: Id<"users">; stars: number },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        } | null
      >;
      pushPrize: FunctionReference<
        "mutation",
        "public",
        { id: Id<"users">; obtainedAt: string; prizeId: string },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        } | null
      >;
      pushPayment: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"users">;
          payment: {
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          };
        },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
      listUsers: FunctionReference<
        "query",
        "public",
        {
          isApprovedOnly?: boolean;
          limit?: number;
          page?: number;
          search?: string;
          tariff?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"users">;
            address_pool?: Array<string>;
            avatar?: null | string;
            bio?: string;
            birthDate?: string;
            city?: string;
            created_at?: string;
            diploma?: string;
            educationPassed?: boolean;
            email: string;
            exp?: number;
            fullName?: string;
            gender?: string;
            isApproved: boolean;
            isCorrect?: boolean;
            isPediatric?: boolean;
            isScientific?: boolean;
            is_banned?: boolean;
            level?: number;
            lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
            metadata?: { description: string; image: string; title: string };
            mongoId?: string;
            name?: string;
            password: string;
            payments?: Array<{
              _id?: string;
              mongoId?: string;
              payment: {
                amount: { currency: string; value: string };
                confirmation: { confirmation_url: string; type: string };
                created_at: string;
                description: string;
                id: string;
                metadata: Record<string, never>;
                paid: boolean;
                recipient: { account_id: string; gateway_id: string };
                refundable: boolean;
                status: string;
                test: boolean;
              };
              plan: string;
              status: string;
              tariff: string;
              user: {
                _id?: string;
                email?: string;
                fullName?: string;
                mongoId?: string;
                phone?: string;
              };
            }>;
            phone: string;
            pinId?: string;
            plan?: string;
            position?: string;
            privateClinic?: boolean;
            referalCount?: number;
            refererId?: string;
            resetCode?: string;
            resetCodeExpires?: string;
            saved?: Array<{
              articleUrl: string;
              category?: string;
              publishedDate: string;
              title_translation_human: string;
            }>;
            specialization?: string;
            stars?: number;
            subscribeTill: string;
            tariff: string;
            telegram?: string;
            trackingPermission?: boolean;
            updatedAt?: string;
            userId?: string;
            viewed?: Array<{
              articleUrl: string;
              publishedDate: string;
              title_translation_human: string;
            }>;
            workplace?: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      approveUser: FunctionReference<
        "mutation",
        "public",
        { id: Id<"users"> },
        boolean
      >;
      approveAll: FunctionReference<
        "mutation",
        "public",
        Record<string, never>,
        number
      >;
      patchById: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"users">;
          patch: {
            address_pool?: Array<string>;
            avatar?: null | string;
            bio?: string;
            birthDate?: string;
            city?: string;
            created_at?: string;
            diploma?: string;
            educationPassed?: boolean;
            email?: string;
            exp?: number;
            fullName?: string;
            gender?: string;
            isApproved?: boolean;
            isCorrect?: boolean;
            isPediatric?: boolean;
            isScientific?: boolean;
            is_banned?: boolean;
            level?: number;
            lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
            metadata?: { description: string; image: string; title: string };
            mongoId?: string;
            name?: string;
            password?: string;
            payments?: Array<{
              _id?: string;
              mongoId?: string;
              payment: {
                amount: { currency: string; value: string };
                confirmation: { confirmation_url: string; type: string };
                created_at: string;
                description: string;
                id: string;
                metadata: Record<string, never>;
                paid: boolean;
                recipient: { account_id: string; gateway_id: string };
                refundable: boolean;
                status: string;
                test: boolean;
              };
              plan: string;
              status: string;
              tariff: string;
              user: {
                _id?: string;
                email?: string;
                fullName?: string;
                mongoId?: string;
                phone?: string;
              };
            }>;
            phone?: string;
            pinId?: string;
            plan?: string;
            position?: string;
            privateClinic?: boolean;
            referalCount?: number;
            refererId?: string;
            resetCode?: string;
            resetCodeExpires?: string;
            saved?: Array<{
              articleUrl: string;
              category?: string;
              publishedDate: string;
              title_translation_human: string;
            }>;
            specialization?: string;
            stars?: number;
            subscribeTill?: string;
            tariff?: string;
            telegram?: string;
            trackingPermission?: boolean;
            updatedAt?: string;
            userId?: string;
            viewed?: Array<{
              articleUrl: string;
              publishedDate: string;
              title_translation_human: string;
            }>;
            workplace?: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
      listByIsApproved: FunctionReference<
        "query",
        "public",
        { isApproved: boolean },
        Array<{
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }>
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"users"> },
        boolean
      >;
      appendViewed: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"users">;
          item: {
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
      appendSaved: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"users">;
          item: {
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
      removeSavedByArticleUrl: FunctionReference<
        "mutation",
        "public",
        { articleUrl: string; id: Id<"users"> },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
      setTrackingPermission: FunctionReference<
        "mutation",
        "public",
        { id: Id<"users">; trackingPermission: boolean },
        {
          _creationTime: number;
          _id: Id<"users">;
          address_pool?: Array<string>;
          avatar?: null | string;
          bio?: string;
          birthDate?: string;
          city?: string;
          created_at?: string;
          diploma?: string;
          educationPassed?: boolean;
          email: string;
          exp?: number;
          fullName?: string;
          gender?: string;
          isApproved: boolean;
          isCorrect?: boolean;
          isPediatric?: boolean;
          isScientific?: boolean;
          is_banned?: boolean;
          level?: number;
          lootboxes?: Array<{ lootboxId: string; obtainedAt: string }>;
          metadata?: { description: string; image: string; title: string };
          mongoId?: string;
          name?: string;
          password: string;
          payments?: Array<{
            _id?: string;
            mongoId?: string;
            payment: {
              amount: { currency: string; value: string };
              confirmation: { confirmation_url: string; type: string };
              created_at: string;
              description: string;
              id: string;
              metadata: Record<string, never>;
              paid: boolean;
              recipient: { account_id: string; gateway_id: string };
              refundable: boolean;
              status: string;
              test: boolean;
            };
            plan: string;
            status: string;
            tariff: string;
            user: {
              _id?: string;
              email?: string;
              fullName?: string;
              mongoId?: string;
              phone?: string;
            };
          }>;
          phone: string;
          pinId?: string;
          plan?: string;
          position?: string;
          privateClinic?: boolean;
          referalCount?: number;
          refererId?: string;
          resetCode?: string;
          resetCodeExpires?: string;
          saved?: Array<{
            articleUrl: string;
            category?: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          specialization?: string;
          stars?: number;
          subscribeTill: string;
          tariff: string;
          telegram?: string;
          trackingPermission?: boolean;
          updatedAt?: string;
          userId?: string;
          viewed?: Array<{
            articleUrl: string;
            publishedDate: string;
            title_translation_human: string;
          }>;
          workplace?: string;
        }
      >;
    };
    pin_comments: {
      listRoot: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; pinId: string; userId?: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_comments">;
            clinicAtlasId?: null | string;
            content: string;
            createdAt?: string;
            likes: Array<any>;
            mongoId?: string;
            parentId?: Id<"pin_comments"> | string;
            pinId?: Id<"pins"> | string;
            responseToUser?: { fullName?: string; id: Id<"users"> | string };
            updatedAt: string;
            userFullName?: string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      add: FunctionReference<
        "mutation",
        "public",
        { content: string; pinId: string; userId: string },
        {
          _creationTime: number;
          _id: Id<"pin_comments">;
          clinicAtlasId?: null | string;
          content: string;
          createdAt?: string;
          likes: Array<any>;
          mongoId?: string;
          parentId?: Id<"pin_comments"> | string;
          pinId?: Id<"pins"> | string;
          responseToUser?: { fullName?: string; id: Id<"users"> | string };
          updatedAt: string;
          userFullName?: string;
          userId: Id<"users"> | string;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"pin_comments"> },
        {
          _creationTime: number;
          _id: Id<"pin_comments">;
          clinicAtlasId?: null | string;
          content: string;
          createdAt?: string;
          likes: Array<any>;
          mongoId?: string;
          parentId?: Id<"pin_comments"> | string;
          pinId?: Id<"pins"> | string;
          responseToUser?: { fullName?: string; id: Id<"users"> | string };
          updatedAt: string;
          userFullName?: string;
          userId: Id<"users"> | string;
        } | null
      >;
      update: FunctionReference<
        "mutation",
        "public",
        { content: string; id: Id<"pin_comments"> },
        {
          _creationTime: number;
          _id: Id<"pin_comments">;
          clinicAtlasId?: null | string;
          content: string;
          createdAt?: string;
          likes: Array<any>;
          mongoId?: string;
          parentId?: Id<"pin_comments"> | string;
          pinId?: Id<"pins"> | string;
          responseToUser?: { fullName?: string; id: Id<"users"> | string };
          updatedAt: string;
          userFullName?: string;
          userId: Id<"users"> | string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_comments"> },
        boolean
      >;
      like: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_comments">; userId: string },
        null
      >;
      unlike: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_comments">; userId: string },
        null
      >;
      getAllByClinicAtlas: FunctionReference<
        "query",
        "public",
        {
          clinicAtlasId: string;
          limit?: number;
          page?: number;
          userId?: string;
          viewerId?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_comments">;
            clinicAtlasId?: null | string;
            content: string;
            createdAt?: string;
            likes: Array<any>;
            mongoId?: string;
            parentId?: Id<"pin_comments"> | string;
            pinId?: Id<"pins"> | string;
            responseToUser?: { fullName?: string; id: Id<"users"> | string };
            updatedAt: string;
            userFullName?: string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      createForClinicAtlas: FunctionReference<
        "mutation",
        "public",
        {
          clinicAtlasId: string;
          content: string;
          parentId?: string;
          userId: string;
        },
        {
          _creationTime: number;
          _id: Id<"pin_comments">;
          clinicAtlasId?: null | string;
          content: string;
          createdAt?: string;
          likes: Array<any>;
          mongoId?: string;
          parentId?: Id<"pin_comments"> | string;
          pinId?: Id<"pins"> | string;
          responseToUser?: { fullName?: string; id: Id<"users"> | string };
          updatedAt: string;
          userFullName?: string;
          userId: Id<"users"> | string;
        }
      >;
      createReply: FunctionReference<
        "mutation",
        "public",
        {
          clinicAtlasId: string;
          content: string;
          replyToCommentId: Id<"pin_comments">;
          userId: string;
        },
        {
          _creationTime: number;
          _id: Id<"pin_comments">;
          clinicAtlasId?: null | string;
          content: string;
          createdAt?: string;
          likes: Array<any>;
          mongoId?: string;
          parentId?: Id<"pin_comments"> | string;
          pinId?: Id<"pins"> | string;
          responseToUser?: { fullName?: string; id: Id<"users"> | string };
          updatedAt: string;
          userFullName?: string;
          userId: Id<"users"> | string;
        }
      >;
      getThread: FunctionReference<
        "query",
        "public",
        {
          limit?: number;
          page?: number;
          parentId: Id<"pin_comments">;
          userId?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_comments">;
            clinicAtlasId?: null | string;
            content: string;
            createdAt?: string;
            likes: Array<any>;
            mongoId?: string;
            parentId?: Id<"pin_comments"> | string;
            pinId?: Id<"pins"> | string;
            responseToUser?: { fullName?: string; id: Id<"users"> | string };
            updatedAt: string;
            userFullName?: string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      addLikeClinicAtlas: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_comments">; userId: string },
        null
      >;
      rating: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          commentsCount: number;
          user: {
            _id: Id<"users">;
            avatar?: string;
            email?: string;
            fullName?: string;
          } | null;
          userId: Id<"users"> | string;
        }>
      >;
      removeLikeClinicAtlas: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_comments">; userId: string },
        null
      >;
    };
    pin_likes: {
      add: FunctionReference<
        "mutation",
        "public",
        { pinId: string; userId: string },
        null
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { pinId: string; userId: string },
        null
      >;
      rating: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          author: {
            _id: Id<"users">;
            avatar?: string;
            email?: string;
            fullName?: string;
          } | null;
          likesCount: number;
          pin: {
            _creationTime: number;
            _id: Id<"pins">;
            author: Id<"users"> | string;
            comments: number;
            createdAt: string;
            description: string;
            image: string;
            likes: number;
            mongoId?: string;
            tags?: Array<Id<"pin_tags"> | string>;
            title: string;
            updatedAt: string;
          };
        }>
      >;
      getUserLikesForPins: FunctionReference<
        "query",
        "public",
        { pinIds: Array<string>; userId: string },
        Array<string>
      >;
    };
    pin_reports: {
      createType: FunctionReference<
        "mutation",
        "public",
        { name: string },
        {
          _creationTime: number;
          _id: Id<"pin_report_type">;
          createdAt?: string;
          mongoId?: string;
          name: string;
          updatedAt: string;
        }
      >;
      getTypes: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_report_type">;
            createdAt?: string;
            mongoId?: string;
            name: string;
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      removeType: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_report_type"> },
        boolean
      >;
      updateType: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_report_type">; name: string },
        {
          _creationTime: number;
          _id: Id<"pin_report_type">;
          createdAt?: string;
          mongoId?: string;
          name: string;
          updatedAt: string;
        }
      >;
      createReport: FunctionReference<
        "mutation",
        "public",
        {
          comment: string;
          pinAuthorId: string;
          pinId: string;
          reporterId: string;
          typeId: string;
        },
        {
          _creationTime: number;
          _id: Id<"pin_reports">;
          admin_comment?: string;
          comment: string;
          createdAt?: string;
          fine: number;
          mongoId?: string;
          pinAuthor: Id<"users"> | string;
          pinId: Id<"pins"> | string;
          reporter: Id<"users"> | string;
          reward: number;
          status: "new" | "approved" | "rejected";
          type: Id<"pin_report_type"> | string;
          updatedAt: string;
        }
      >;
      listReports: FunctionReference<
        "query",
        "public",
        {
          limit?: number;
          page?: number;
          pinAuthorId?: string;
          pinId?: string;
          reporterId?: string;
          status?: "new" | "approved" | "rejected";
          typeId?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_reports">;
            admin_comment?: string;
            comment: string;
            createdAt?: string;
            fine: number;
            mongoId?: string;
            pinAuthor: Id<"users"> | string;
            pinId: Id<"pins"> | string;
            reporter: Id<"users"> | string;
            reward: number;
            status: "new" | "approved" | "rejected";
            type: Id<"pin_report_type"> | string;
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"pin_reports"> },
        {
          _creationTime: number;
          _id: Id<"pin_reports">;
          admin_comment?: string;
          comment: string;
          createdAt?: string;
          fine: number;
          mongoId?: string;
          pinAuthor: Id<"users"> | string;
          pinId: Id<"pins"> | string;
          reporter: Id<"users"> | string;
          reward: number;
          status: "new" | "approved" | "rejected";
          type: Id<"pin_report_type"> | string;
          updatedAt: string;
        } | null
      >;
      setStatus: FunctionReference<
        "mutation",
        "public",
        {
          admin_comment: string;
          fine: number;
          id: Id<"pin_reports">;
          reward: number;
          status: "approved" | "rejected";
        },
        {
          _creationTime: number;
          _id: Id<"pin_reports">;
          admin_comment?: string;
          comment: string;
          createdAt?: string;
          fine: number;
          mongoId?: string;
          pinAuthor: Id<"users"> | string;
          pinId: Id<"pins"> | string;
          reporter: Id<"users"> | string;
          reward: number;
          status: "new" | "approved" | "rejected";
          type: Id<"pin_report_type"> | string;
          updatedAt: string;
        }
      >;
      adminDeletePin: FunctionReference<
        "mutation",
        "public",
        {
          adminComment: string;
          adminId?: string;
          fine?: number;
          pinId: string;
        },
        { deletedPinId: string; success: boolean }
      >;
    };
    pin_tags: {
      getAll: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; search?: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_tags">;
            createdAt?: string;
            mongoId?: string;
            name: string;
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      list: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; search?: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_tags">;
            createdAt?: string;
            mongoId?: string;
            name: string;
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"pin_tags"> },
        {
          _creationTime: number;
          _id: Id<"pin_tags">;
          createdAt?: string;
          mongoId?: string;
          name: string;
          updatedAt: string;
        } | null
      >;
      create: FunctionReference<
        "mutation",
        "public",
        { name: string },
        {
          _creationTime: number;
          _id: Id<"pin_tags">;
          createdAt?: string;
          mongoId?: string;
          name: string;
          updatedAt: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_tags">; name?: string },
        {
          _creationTime: number;
          _id: Id<"pin_tags">;
          createdAt?: string;
          mongoId?: string;
          name: string;
          updatedAt: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pin_tags"> },
        boolean
      >;
      setUserFavoriteTags: FunctionReference<
        "mutation",
        "public",
        { tagIds: Array<Id<"pin_tags">>; userId: Id<"users"> },
        boolean
      >;
      getUserFavoriteTags: FunctionReference<
        "query",
        "public",
        { userId: Id<"users"> },
        Array<{
          _creationTime: number;
          _id: Id<"pin_tags">;
          createdAt?: string;
          mongoId?: string;
          name: string;
          updatedAt: string;
        }> | null
      >;
      addUserFavoriteTags: FunctionReference<
        "mutation",
        "public",
        { tagIds: Array<Id<"pin_tags">>; userId: Id<"users"> },
        boolean
      >;
      removeUserFavoriteTags: FunctionReference<
        "mutation",
        "public",
        { tagIds: Array<Id<"pin_tags">>; userId: Id<"users"> },
        boolean
      >;
      getPopularTags: FunctionReference<
        "query",
        "public",
        { limit?: number },
        Array<{
          _creationTime: number;
          _id: Id<"pin_tags">;
          createdAt: string;
          mongoId?: string;
          name: string;
          updatedAt: string;
          usageCount: number;
        }>
      >;
    };
    pins: {
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"pins"> },
        {
          _creationTime: number;
          _id: Id<"pins">;
          author: Id<"users"> | string;
          comments: number;
          createdAt?: string;
          description: string;
          image: string;
          likes: number;
          mongoId?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
          updatedAt: string;
        } | null
      >;
      list: FunctionReference<
        "query",
        "public",
        {
          author?: string;
          limit?: number;
          page?: number;
          search?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          userId?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pins">;
            author: Id<"users"> | string;
            comments: number;
            createdAt?: string;
            description: string;
            image: string;
            likes: number;
            mongoId?: string;
            tags?: Array<Id<"pin_tags"> | string>;
            title: string;
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          author: Id<"users"> | string;
          comments: number;
          createdAt: string;
          description: string;
          image: string;
          likes: number;
          mongoId?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
          updatedAt: string;
        },
        {
          _creationTime: number;
          _id: Id<"pins">;
          author: Id<"users"> | string;
          comments: number;
          createdAt?: string;
          description: string;
          image: string;
          likes: number;
          mongoId?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
          updatedAt: string;
        }
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          author: Id<"users"> | string;
          comments?: number;
          description: string;
          image: { base64: string; contentType: string };
          likes?: number;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
        },
        {
          _creationTime: number;
          _id: Id<"pins">;
          author: Id<"users"> | string;
          comments: number;
          createdAt?: string;
          description: string;
          image: string;
          likes: number;
          mongoId?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
          updatedAt: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            description?: string;
            image?: string;
            tags?: Array<Id<"pin_tags"> | string>;
            title?: string;
          };
          id: Id<"pins">;
        },
        {
          _creationTime: number;
          _id: Id<"pins">;
          author: Id<"users"> | string;
          comments: number;
          createdAt?: string;
          description: string;
          image: string;
          likes: number;
          mongoId?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
          updatedAt: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"pins"> },
        boolean
      >;
      getSimilarPins: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; pinId: Id<"pins">; userId?: string },
        Array<{
          _creationTime: number;
          _id: Id<"pins">;
          author: Id<"users"> | string;
          comments: number;
          createdAt?: string;
          description: string;
          image: string;
          likes: number;
          mongoId?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
          updatedAt: string;
        }>
      >;
      getSimilarPinsByTitle: FunctionReference<
        "query",
        "public",
        {
          keywords: Array<string>;
          limit?: number;
          page?: number;
          pinId: Id<"pins">;
          userId?: string;
        },
        Array<{
          _creationTime: number;
          _id: Id<"pins">;
          author: Id<"users"> | string;
          comments: number;
          createdAt?: string;
          description: string;
          image: string;
          likes: number;
          mongoId?: string;
          tags?: Array<Id<"pin_tags"> | string>;
          title: string;
          updatedAt: string;
        }>
      >;
      rating: FunctionReference<
        "query",
        "public",
        { end_date?: string; start_date?: string },
        Array<{
          authorId: Id<"users"> | string;
          pinsCount: number;
          user: {
            _id: Id<"users">;
            avatar?: string;
            email?: string;
            fullName?: string;
          } | null;
        }>
      >;
    };
    prize_claims: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          prizeId: Id<"prizes">;
          transactionId: Id<"stars_transactions"> | string;
          userId: string;
        },
        {
          _creationTime: number;
          _id: Id<"prize_claims">;
          claimedAt: string;
          mongoId?: string;
          prizeId: Id<"prizes"> | string;
          status: "pending" | "claimed" | "backlog" | "refund" | "canceled";
          transactionId: Id<"stars_transactions"> | string;
          userId: Id<"users"> | string;
        }
      >;
      listByUser: FunctionReference<
        "query",
        "public",
        { userId: string },
        Array<{
          _creationTime: number;
          _id: Id<"prize_claims">;
          claimedAt: string;
          mongoId?: string;
          prizeId: Id<"prizes"> | string;
          status: "pending" | "claimed" | "backlog" | "refund" | "canceled";
          transactionId: Id<"stars_transactions"> | string;
          userId: Id<"users"> | string;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"prize_claims"> },
        {
          _creationTime: number;
          _id: Id<"prize_claims">;
          claimedAt: string;
          mongoId?: string;
          prizeId: Id<"prizes"> | string;
          status: "pending" | "claimed" | "backlog" | "refund" | "canceled";
          transactionId: Id<"stars_transactions"> | string;
          userId: Id<"users"> | string;
        } | null
      >;
      updateStatus: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"prize_claims">;
          status: "pending" | "claimed" | "backlog" | "refund" | "canceled";
        },
        {
          _creationTime: number;
          _id: Id<"prize_claims">;
          claimedAt: string;
          mongoId?: string;
          prizeId: Id<"prizes"> | string;
          status: "pending" | "claimed" | "backlog" | "refund" | "canceled";
          transactionId: Id<"stars_transactions"> | string;
          userId: Id<"users"> | string;
        }
      >;
      list: FunctionReference<
        "query",
        "public",
        {
          limit?: number | string;
          page?: number | string;
          prizeId?: Id<"prizes">;
          status?: "pending" | "claimed" | "backlog" | "refund" | "canceled";
          userId?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"prize_claims">;
            claimedAt: string;
            mongoId?: string;
            prizeId: Id<"prizes"> | string;
            status: "pending" | "claimed" | "backlog" | "refund" | "canceled";
            transactionId: Id<"stars_transactions"> | string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"prize_claims"> },
        boolean
      >;
      listWithDetails: FunctionReference<
        "query",
        "public",
        {
          limit?: number | string;
          page?: number | string;
          status?: "pending" | "claimed" | "backlog" | "refund" | "canceled";
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"prize_claims">;
            claimedAt: string;
            mongoId?: string;
            prizeId: Id<"prizes"> | string;
            prizeInfo: {
              _id: string;
              description?: string;
              image?: string;
              name?: string;
              price?: number;
            };
            status: "pending" | "claimed" | "backlog" | "refund" | "canceled";
            transactionId: Id<"stars_transactions"> | string;
            userId: Id<"users"> | string;
            userInfo: {
              _id: string;
              avatar?: null | string;
              email?: string;
              exp?: number;
              level?: number;
              name?: string;
              stars?: number;
            };
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      approveRefund: FunctionReference<
        "mutation",
        "public",
        { id: Id<"prize_claims"> },
        { restoredStars: number; success: boolean }
      >;
      pullPrizeFromUserInventory: FunctionReference<
        "mutation",
        "public",
        { prizeMongoId: string; userId: Id<"users"> },
        boolean
      >;
    };
    prizes: {
      list: FunctionReference<
        "query",
        "public",
        { level?: number; limit?: number; page?: number; search?: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"prizes">;
            description: string;
            image: string;
            level: number;
            mongoId?: string;
            name: string;
            price: number;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"prizes"> },
        {
          _creationTime: number;
          _id: Id<"prizes">;
          description: string;
          image: string;
          level: number;
          mongoId?: string;
          name: string;
          price: number;
        } | null
      >;
      getByLevel: FunctionReference<
        "query",
        "public",
        { level: number },
        Array<{
          _creationTime: number;
          _id: Id<"prizes">;
          description: string;
          image: string;
          level: number;
          mongoId?: string;
          name: string;
          price: number;
        }>
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          description: string;
          image: string;
          level: number;
          mongoId?: string;
          name: string;
          price: number;
        },
        {
          _creationTime: number;
          _id: Id<"prizes">;
          description: string;
          image: string;
          level: number;
          mongoId?: string;
          name: string;
          price: number;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            description?: string;
            image?: string;
            level?: number;
            name?: string;
            price?: number;
          };
          id: Id<"prizes">;
        },
        {
          _creationTime: number;
          _id: Id<"prizes">;
          description: string;
          image: string;
          level: number;
          mongoId?: string;
          name: string;
          price: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"prizes"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          description: string;
          image: { base64: string; contentType: string };
          level: number;
          name: string;
          price: number;
        },
        {
          _creationTime: number;
          _id: Id<"prizes">;
          description: string;
          image: string;
          level: number;
          mongoId?: string;
          name: string;
          price: number;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          description?: string;
          id: Id<"prizes">;
          image?: { base64: string; contentType: string };
          level?: number;
          name?: string;
          price?: number;
        },
        {
          _creationTime: number;
          _id: Id<"prizes">;
          description: string;
          image: string;
          level: number;
          mongoId?: string;
          name: string;
          price: number;
        }
      >;
    };
    progress: {
      getTaskProgress: FunctionReference<
        "query",
        "public",
        { taskId: Id<"tasks">; userId: Id<"users"> },
        {
          _creationTime: number;
          _id: Id<"task_progress">;
          claimedAt?: string;
          completedAt?: null | string;
          createdAt?: string;
          currentProgress: number;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          targetAmount: number;
          taskId: Id<"tasks"> | string;
          updatedAt: string;
          userId: Id<"users"> | string;
        } | null
      >;
      upsertTaskProgress: FunctionReference<
        "mutation",
        "public",
        {
          claimedAt?: string;
          completedAt?: null | string;
          createdAt?: string;
          currentProgress: number;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          targetAmount: number;
          taskId: Id<"tasks"> | string;
          updatedAt: string;
          userId: Id<"users"> | string;
        },
        {
          _creationTime: number;
          _id: Id<"task_progress">;
          claimedAt?: string;
          completedAt?: null | string;
          createdAt?: string;
          currentProgress: number;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          targetAmount: number;
          taskId: Id<"tasks"> | string;
          updatedAt: string;
          userId: Id<"users"> | string;
        }
      >;
      listTaskProgressByUserGroup: FunctionReference<
        "query",
        "public",
        { groupId: Id<"task_groups">; userId: Id<"users"> },
        Array<{
          _creationTime: number;
          _id: Id<"task_progress">;
          claimedAt?: string;
          completedAt?: null | string;
          createdAt?: string;
          currentProgress: number;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          targetAmount: number;
          taskId: Id<"tasks"> | string;
          updatedAt: string;
          userId: Id<"users"> | string;
        }>
      >;
      listCompletedByUser: FunctionReference<
        "query",
        "public",
        { userId: Id<"users"> },
        Array<{
          _creationTime: number;
          _id: Id<"task_progress">;
          claimedAt?: string;
          completedAt?: null | string;
          createdAt?: string;
          currentProgress: number;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          targetAmount: number;
          taskId: Id<"tasks"> | string;
          updatedAt: string;
          userId: Id<"users"> | string;
        }>
      >;
      getGroupProgress: FunctionReference<
        "query",
        "public",
        { groupId: Id<"task_groups">; userId: Id<"users"> },
        {
          _creationTime: number;
          _id: Id<"group_progress">;
          claimedAt?: string;
          completedAt?: string | null;
          completedTasks: Array<Id<"tasks"> | string>;
          createdAt?: string;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          totalTasks: number;
          updatedAt: string;
          userId: Id<"users"> | string;
        } | null
      >;
      upsertGroupProgress: FunctionReference<
        "mutation",
        "public",
        {
          claimedAt?: string;
          completedAt?: string | null;
          completedTasks: Array<Id<"tasks"> | string>;
          createdAt?: string;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          totalTasks: number;
          updatedAt: string;
          userId: Id<"users"> | string;
        },
        {
          _creationTime: number;
          _id: Id<"group_progress">;
          claimedAt?: string;
          completedAt?: string | null;
          completedTasks: Array<Id<"tasks"> | string>;
          createdAt?: string;
          groupId: Id<"task_groups"> | string;
          isCompleted: boolean;
          mongoId?: string;
          rewardClaimed: boolean;
          totalTasks: number;
          updatedAt: string;
          userId: Id<"users"> | string;
        }
      >;
      getUserLevel: FunctionReference<
        "query",
        "public",
        { userId: Id<"users"> },
        {
          _creationTime: number;
          _id: Id<"user_levels">;
          createdAt?: string;
          exp: number;
          expToNextLevel: number;
          level: number;
          leveledUpAt: string;
          mongoId?: string;
          updatedAt: string;
          userId: Id<"users"> | string;
        } | null
      >;
      upsertUserLevel: FunctionReference<
        "mutation",
        "public",
        {
          createdAt?: string;
          exp: number;
          expToNextLevel: number;
          level: number;
          leveledUpAt: string;
          mongoId?: string;
          updatedAt: string;
          userId: Id<"users"> | string;
        },
        {
          _creationTime: number;
          _id: Id<"user_levels">;
          createdAt?: string;
          exp: number;
          expToNextLevel: number;
          level: number;
          leveledUpAt: string;
          mongoId?: string;
          updatedAt: string;
          userId: Id<"users"> | string;
        }
      >;
      claimGroupReward: FunctionReference<
        "mutation",
        "public",
        { groupId: Id<"task_groups">; userId: Id<"users"> },
        {
          message: string;
          reward?: any;
          rewards?: Array<{
            amount: number;
            id?: string;
            title: string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          success: boolean;
        }
      >;
      getUserLevelProgress: FunctionReference<
        "query",
        "public",
        { userId: Id<"users"> },
        {
          completed: number;
          groupId?: string;
          groupName?: string;
          level: number;
          need: number;
        }
      >;
      levelUp: FunctionReference<
        "mutation",
        "public",
        { userId: Id<"users"> },
        {
          lootboxes?: Array<any>;
          message: string;
          newLevel?: number;
          success: boolean;
        }
      >;
    };
    interactive_tasks: {
      list: FunctionReference<
        "query",
        "public",
        {
          admin_id?: string;
          app_visible?: boolean;
          forcePublish?: boolean;
          limit?: number;
          nozology?: string;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"interactive_tasks">;
            answers: Array<{ answer: string; image: string }>;
            app_visible?: boolean;
            available_errors: number;
            cover_image: string;
            description?: string;
            difficulty: number;
            feedback: Array<{
              analytic_questions: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
            }>;
            idx?: number;
            mongoId?: string;
            name: string;
            nozology: Id<"nozologies"> | string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
            stars: number;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"interactive_tasks"> },
        {
          _creationTime: number;
          _id: Id<"interactive_tasks">;
          answers: Array<{ answer: string; image: string }>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          description?: string;
          difficulty: number;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          answers: Array<{ answer: string; image: string }>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          description?: string;
          difficulty: number;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_tasks">;
          answers: Array<{ answer: string; image: string }>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          description?: string;
          difficulty: number;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            answers?: Array<{ answer: string; image: string }>;
            app_visible?: boolean;
            available_errors?: number;
            cover_image?: string;
            description?: string;
            difficulty?: number;
            feedback?: any;
            idx?: number;
            name?: string;
            nozology?: string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
            stars?: number;
          };
          id: Id<"interactive_tasks">;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_tasks">;
          answers: Array<{ answer: string; image: string }>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          description?: string;
          difficulty: number;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"interactive_tasks"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          answers: Array<{
            answer: string;
            image: string | { base64: string; contentType: string };
          }>;
          app_visible?: boolean;
          available_errors: number;
          cover: { base64: string; contentType: string };
          description?: string;
          difficulty: number;
          feedback: any;
          idx?: number;
          name: string;
          nozology: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_tasks">;
          answers: Array<{ answer: string; image: string }>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          description?: string;
          difficulty: number;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          answers?: Array<{
            answer: string;
            image: string | { base64: string; contentType: string };
          }>;
          app_visible?: boolean;
          available_errors?: number;
          cover?: { base64: string; contentType: string };
          description?: string;
          difficulty?: number;
          feedback?: any;
          id: Id<"interactive_tasks">;
          idx?: number;
          name?: string;
          nozology?: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars?: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_tasks">;
          answers: Array<{ answer: string; image: string }>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          description?: string;
          difficulty: number;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
    };
    lections: {
      list: FunctionReference<
        "query",
        "public",
        {
          admin_id?: string;
          app_visible?: boolean;
          forcePublish?: boolean;
          limit?: number;
          nozology?: string;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"lections">;
            app_visible?: boolean;
            cover_image: string;
            description: string;
            duration: string;
            feedback: Array<{
              analytic_questions: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
            }>;
            idx?: number;
            mongoId?: string;
            name: string;
            nozology: Id<"nozologies"> | string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
            stars: number;
            video: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"lections"> },
        {
          _creationTime: number;
          _id: Id<"lections">;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          duration: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          video: string;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          app_visible?: boolean;
          cover_image: string;
          description: string;
          duration: string;
          feedback: any;
          idx?: number;
          name: string;
          nozology: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          video: string;
        },
        {
          _creationTime: number;
          _id: Id<"lections">;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          duration: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          video: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            app_visible?: boolean;
            cover_image?: string;
            description?: string;
            duration?: string;
            feedback?: any;
            idx?: number;
            name?: string;
            nozology?: string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
            stars?: number;
            video?: string;
          };
          id: Id<"lections">;
        },
        {
          _creationTime: number;
          _id: Id<"lections">;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          duration: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          video: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"lections"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          app_visible?: boolean;
          cover: { base64: string; contentType: string };
          description: string;
          duration: string;
          feedback: any;
          idx?: number;
          name: string;
          nozology: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          video?: { base64: string; contentType: string };
          videoPath?: string;
        },
        {
          _creationTime: number;
          _id: Id<"lections">;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          duration: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          video: string;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          app_visible?: boolean;
          cover?: { base64: string; contentType: string };
          description?: string;
          duration?: string;
          feedback?: any;
          id: Id<"lections">;
          idx?: number;
          name?: string;
          nozology?: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars?: number;
          video?: { base64: string; contentType: string };
          videoPath?: string;
        },
        {
          _creationTime: number;
          _id: Id<"lections">;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          duration: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          video: string;
        }
      >;
    };
    lootbox_claims: {
      listByUser: FunctionReference<
        "query",
        "public",
        {
          limit?: number;
          page?: number;
          status?: "open" | "closed";
          user_id: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"lootbox_claims">;
            createdAt?: string;
            item?: {
              amount: number;
              chance?: number;
              objectId?: null | Id<"prizes"> | Id<"lootboxes"> | string;
              type: "stars" | "exp" | "prize" | "lootbox";
            };
            itemIndex?: number;
            lootboxId: Id<"lootboxes"> | string;
            mongoId?: string;
            status: "open" | "closed";
            updatedAt?: string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"lootbox_claims"> },
        {
          _creationTime: number;
          _id: Id<"lootbox_claims">;
          createdAt?: string;
          item?: {
            amount: number;
            chance?: number;
            objectId?: null | Id<"prizes"> | Id<"lootboxes"> | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          };
          itemIndex?: number;
          lootboxId: Id<"lootboxes"> | string;
          mongoId?: string;
          status: "open" | "closed";
          updatedAt?: string;
          userId: Id<"users"> | string;
        } | null
      >;
      create: FunctionReference<
        "mutation",
        "public",
        { lootbox_id: Id<"lootboxes">; user_id: string },
        {
          _creationTime: number;
          _id: Id<"lootbox_claims">;
          createdAt?: string;
          item?: {
            amount: number;
            chance?: number;
            objectId?: null | Id<"prizes"> | Id<"lootboxes"> | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          };
          itemIndex?: number;
          lootboxId: Id<"lootboxes"> | string;
          mongoId?: string;
          status: "open" | "closed";
          updatedAt?: string;
          userId: Id<"users"> | string;
        }
      >;
      open: FunctionReference<
        "mutation",
        "public",
        { id: Id<"lootbox_claims">; user_id: string },
        {
          _creationTime: number;
          _id: Id<"lootbox_claims">;
          createdAt?: string;
          item?: {
            amount: number;
            chance?: number;
            objectId?: null | Id<"prizes"> | Id<"lootboxes"> | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          };
          itemIndex?: number;
          lootboxId: Id<"lootboxes"> | string;
          mongoId?: string;
          status: "open" | "closed";
          updatedAt?: string;
          userId: Id<"users"> | string;
        }
      >;
    };
    lootboxes: {
      list: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; search?: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"lootboxes">;
            description: string;
            image: string;
            items: Array<{
              amount: number;
              chance: number;
              objectId?: null | string;
              type: "stars" | "exp" | "prize" | "lootbox";
            }>;
            mongoId?: string;
            title: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"lootboxes"> },
        {
          _creationTime: number;
          _id: Id<"lootboxes">;
          description: string;
          image: string;
          items: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          mongoId?: string;
          title: string;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          description: string;
          image: string;
          items: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          mongoId?: string;
          title: string;
        },
        {
          _creationTime: number;
          _id: Id<"lootboxes">;
          description: string;
          image: string;
          items: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          mongoId?: string;
          title: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            description?: string;
            image?: string;
            items?: Array<{
              amount: number;
              chance: number;
              objectId?: null | string;
              type: "stars" | "exp" | "prize" | "lootbox";
            }>;
            title?: string;
          };
          id: Id<"lootboxes">;
        },
        {
          _creationTime: number;
          _id: Id<"lootboxes">;
          description: string;
          image: string;
          items: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          mongoId?: string;
          title: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"lootboxes"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          description: string;
          image: { base64: string; contentType: string };
          items: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          title: string;
        },
        {
          _creationTime: number;
          _id: Id<"lootboxes">;
          description: string;
          image: string;
          items: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          mongoId?: string;
          title: string;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          description?: string;
          id: Id<"lootboxes">;
          image?: { base64: string; contentType: string };
          items?: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          title?: string;
        },
        {
          _creationTime: number;
          _id: Id<"lootboxes">;
          description: string;
          image: string;
          items: Array<{
            amount: number;
            chance: number;
            objectId?: null | string;
            type: "stars" | "exp" | "prize" | "lootbox";
          }>;
          mongoId?: string;
          title: string;
        }
      >;
    };
    migration: {
      insertRaw: FunctionReference<
        "mutation",
        "public",
        { doc: any; table: string },
        string
      >;
      patchById: FunctionReference<
        "mutation",
        "public",
        { data: any; id: string; table: string },
        boolean
      >;
      listAllPaged: FunctionReference<
        "query",
        "public",
        { cursor?: string; limit: number; table: string },
        { cursor: string | null; isDone: boolean; items: Array<any> }
      >;
      idMapByMongoId: FunctionReference<
        "query",
        "public",
        { table: string },
        Array<{ id: string; mongoId: string }>
      >;
      removeFieldById: FunctionReference<
        "mutation",
        "public",
        { field: string; id: string; table: string },
        boolean
      >;
      truncateTable: FunctionReference<
        "mutation",
        "public",
        { batchSize?: number; table: string },
        number
      >;
    };
    notifications: {
      listByUser: FunctionReference<
        "query",
        "public",
        {
          limit?: number;
          onlyUnread?: boolean;
          page?: number;
          type?: string;
          userId: Id<"users"> | string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"notifications">;
            createdAt?: string;
            data: {
              amount?: null | number;
              commentId?: Id<"pin_comments">;
              commentText?: string;
              folderId?: Id<"folders">;
              folderName?: string;
              fromUserId?: Id<"users">;
              fromUserName?: string;
              groupId?: string;
              groupName?: string;
              isFinished?: boolean;
              knowledgeId?:
                | string
                | Id<"clinic_tasks">
                | Id<"interactive_tasks">
                | Id<"interactive_matches">
                | Id<"interactive_quizzes">
                | Id<"lections">;
              knowledgeName?: string;
              knowledgeType?: string;
              message?: string;
              newLevel?: number;
              oldLevel?: number;
              operationType?: string;
              pinId?: string;
              pinTitle?: string;
              reason?: string;
              requestId?: Id<"collaboration_requests">;
              rewardExp?: number;
              rewardStars?: number;
              taskId?: string;
              taskTitle?: string;
              transactionType?: string;
              type?: string;
            };
            isViewed: boolean;
            mongoId?: string;
            type: string;
            updatedAt: string;
            userId: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
          unreadCount: number;
        }
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          createdAt?: string;
          data: {
            amount?: null | number;
            commentId?: Id<"pin_comments">;
            commentText?: string;
            folderId?: Id<"folders">;
            folderName?: string;
            fromUserId?: Id<"users">;
            fromUserName?: string;
            groupId?: string;
            groupName?: string;
            isFinished?: boolean;
            knowledgeId?:
              | string
              | Id<"clinic_tasks">
              | Id<"interactive_tasks">
              | Id<"interactive_matches">
              | Id<"interactive_quizzes">
              | Id<"lections">;
            knowledgeName?: string;
            knowledgeType?: string;
            message?: string;
            newLevel?: number;
            oldLevel?: number;
            operationType?: string;
            pinId?: string;
            pinTitle?: string;
            reason?: string;
            requestId?: Id<"collaboration_requests">;
            rewardExp?: number;
            rewardStars?: number;
            taskId?: string;
            taskTitle?: string;
            transactionType?: string;
            type?: string;
          };
          isViewed: boolean;
          mongoId?: string;
          type: string;
          updatedAt: string;
          userId: string;
        },
        {
          _creationTime: number;
          _id: Id<"notifications">;
          createdAt?: string;
          data: {
            amount?: null | number;
            commentId?: Id<"pin_comments">;
            commentText?: string;
            folderId?: Id<"folders">;
            folderName?: string;
            fromUserId?: Id<"users">;
            fromUserName?: string;
            groupId?: string;
            groupName?: string;
            isFinished?: boolean;
            knowledgeId?:
              | string
              | Id<"clinic_tasks">
              | Id<"interactive_tasks">
              | Id<"interactive_matches">
              | Id<"interactive_quizzes">
              | Id<"lections">;
            knowledgeName?: string;
            knowledgeType?: string;
            message?: string;
            newLevel?: number;
            oldLevel?: number;
            operationType?: string;
            pinId?: string;
            pinTitle?: string;
            reason?: string;
            requestId?: Id<"collaboration_requests">;
            rewardExp?: number;
            rewardStars?: number;
            taskId?: string;
            taskTitle?: string;
            transactionType?: string;
            type?: string;
          };
          isViewed: boolean;
          mongoId?: string;
          type: string;
          updatedAt: string;
          userId: string;
        }
      >;
      markAsRead: FunctionReference<
        "mutation",
        "public",
        { id: Id<"notifications">; userId: Id<"users"> | string },
        boolean
      >;
      markAllAsRead: FunctionReference<
        "mutation",
        "public",
        { userId: Id<"users"> | string },
        number
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"notifications">; userId: Id<"users"> | string },
        boolean
      >;
      deleteAllByUser: FunctionReference<
        "mutation",
        "public",
        { batchSize?: number; userId: Id<"users"> | string },
        number
      >;
    };
    nozologies: {
      list: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          _creationTime: number;
          _id: Id<"nozologies">;
          category_id: Id<"categories"> | string;
          cover_image?: string | null;
          description?: string | null;
          idx?: number;
          mongoId?: string;
          name: string;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"nozologies"> },
        {
          _creationTime: number;
          _id: Id<"nozologies">;
          category_id: Id<"categories"> | string;
          cover_image?: string | null;
          description?: string | null;
          idx?: number;
          mongoId?: string;
          name: string;
        } | null
      >;
      materialsCount: FunctionReference<
        "query",
        "public",
        { mongoId?: string; nozology?: string; nozologyId?: string },
        {
          brochures: number;
          clinic_atlas: number;
          clinic_task: number;
          interactive_quiz: number;
          interactive_task: number;
          lections: number;
          total: number;
        }
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          category_id?: string;
          cover_image?: string;
          description?: string;
          idx?: number;
          name: string;
        },
        {
          _creationTime: number;
          _id: Id<"nozologies">;
          category_id: Id<"categories"> | string;
          cover_image?: string | null;
          description?: string | null;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            category_id?: string;
            cover_image?: string;
            description?: string;
            idx?: number;
            name?: string;
          };
          id: Id<"nozologies">;
        },
        {
          _creationTime: number;
          _id: Id<"nozologies">;
          category_id: Id<"categories"> | string;
          cover_image?: string | null;
          description?: string | null;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"nozologies"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          category_id?: string;
          cover?: { base64: string; contentType: string };
          description?: string;
          idx?: number;
          name: string;
        },
        {
          _creationTime: number;
          _id: Id<"nozologies">;
          category_id: Id<"categories"> | string;
          cover_image?: string | null;
          description?: string | null;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          category_id?: string;
          cover?: { base64: string; contentType: string };
          description?: string;
          id: Id<"nozologies">;
          idx?: number;
          name?: string;
        },
        {
          _creationTime: number;
          _id: Id<"nozologies">;
          category_id: Id<"categories"> | string;
          cover_image?: string | null;
          description?: string | null;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
    };
    payments: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          amount?: { currency: string; value: string };
          authorization_details?: {
            auth_code: string;
            rrn: string;
            three_d_secure: {
              applied: boolean;
              authentication_value?: string;
              challenge_completed?: boolean;
              ds_transaction_id?: string;
              eci?: string;
              method_completed?: boolean;
              protocol?: string;
              three_d_secure_server_transaction_id?: string;
              xid?: string;
            };
          };
          captured_at?: string;
          confirmation?: { confirmation_url: string; type: string };
          created_at?: string;
          description?: string;
          event?: string;
          id?: string;
          income_amount?: { currency: string; value: string };
          metadata?: Record<string, never>;
          mongoId?: string;
          object?: {
            amount: { currency: string; value: string };
            authorization_details: {
              auth_code: string;
              rrn: string;
              three_d_secure: {
                applied: boolean;
                challenge_completed: boolean;
                method_completed: boolean;
                protocol: string;
              };
            };
            captured_at: string;
            created_at: string;
            description: string;
            id: string;
            income_amount: { currency: string; value: string };
            metadata: Record<string, never>;
            paid: boolean;
            payment_method: {
              card: {
                card_product: { code: string; name: string };
                card_type: string;
                expiry_month: string;
                expiry_year: string;
                first6: string;
                issuer_country: string;
                issuer_name: string;
                last4: string;
              };
              id: string;
              saved: boolean;
              status: string;
              title: string;
              type: string;
            };
            receipt_registration: string;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            refunded_amount: { currency: string; value: string };
            status: string;
            test: boolean;
          };
          paid?: boolean;
          payment?: {
            amount: { currency: string; value: string };
            confirmation: { confirmation_url: string; type: string };
            created_at: string;
            description: string;
            id: string;
            metadata: Record<string, never>;
            paid: boolean;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            status: string;
            test: boolean;
          };
          payment_method?: {
            account_number?: string;
            card?: {
              card_product?: { code: string; name: string };
              card_type: string;
              expiry_month: string;
              expiry_year: string;
              first6: string;
              issuer_country?: string;
              issuer_name?: string;
              last4: string;
            };
            id: string;
            saved: boolean;
            status?: string;
            title?: string;
            type: string;
          };
          plan?: string;
          recipient?: { account_id: string; gateway_id: string };
          refundable?: boolean;
          refunded_amount?: { currency: string; value: string };
          status?: string;
          tariff?: string;
          test?: boolean;
          type?: string;
          user?: {
            email: string;
            fullName?: string;
            mongoId: string;
            phone: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"payments">;
          amount?: { currency: string; value: string };
          authorization_details?: {
            auth_code: string;
            rrn: string;
            three_d_secure: {
              applied: boolean;
              authentication_value?: string;
              challenge_completed?: boolean;
              ds_transaction_id?: string;
              eci?: string;
              method_completed?: boolean;
              protocol?: string;
              three_d_secure_server_transaction_id?: string;
              xid?: string;
            };
          };
          captured_at?: string;
          confirmation?: { confirmation_url: string; type: string };
          created_at?: string;
          description?: string;
          event?: string;
          id?: string;
          income_amount?: { currency: string; value: string };
          metadata?: Record<string, never>;
          mongoId?: string;
          object?: {
            amount: { currency: string; value: string };
            authorization_details: {
              auth_code: string;
              rrn: string;
              three_d_secure: {
                applied: boolean;
                challenge_completed: boolean;
                method_completed: boolean;
                protocol: string;
              };
            };
            captured_at: string;
            created_at: string;
            description: string;
            id: string;
            income_amount: { currency: string; value: string };
            metadata: Record<string, never>;
            paid: boolean;
            payment_method: {
              card: {
                card_product: { code: string; name: string };
                card_type: string;
                expiry_month: string;
                expiry_year: string;
                first6: string;
                issuer_country: string;
                issuer_name: string;
                last4: string;
              };
              id: string;
              saved: boolean;
              status: string;
              title: string;
              type: string;
            };
            receipt_registration: string;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            refunded_amount: { currency: string; value: string };
            status: string;
            test: boolean;
          };
          paid?: boolean;
          payment?: {
            amount: { currency: string; value: string };
            confirmation: { confirmation_url: string; type: string };
            created_at: string;
            description: string;
            id: string;
            metadata: Record<string, never>;
            paid: boolean;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            status: string;
            test: boolean;
          };
          payment_method?: {
            account_number?: string;
            card?: {
              card_product?: { code: string; name: string };
              card_type: string;
              expiry_month: string;
              expiry_year: string;
              first6: string;
              issuer_country?: string;
              issuer_name?: string;
              last4: string;
            };
            id: string;
            saved: boolean;
            status?: string;
            title?: string;
            type: string;
          };
          plan?: string;
          recipient?: { account_id: string; gateway_id: string };
          refundable?: boolean;
          refunded_amount?: { currency: string; value: string };
          status?: string;
          tariff?: string;
          test?: boolean;
          type?: string;
          user?: {
            email: string;
            fullName?: string;
            mongoId: string;
            phone: string;
          };
        }
      >;
      updateByPaymentId: FunctionReference<
        "mutation",
        "public",
        { patch: { status?: string }; paymentId: string },
        boolean
      >;
      getByPaymentId: FunctionReference<
        "query",
        "public",
        { paymentId: string },
        {
          _creationTime: number;
          _id: Id<"payments">;
          amount?: { currency: string; value: string };
          authorization_details?: {
            auth_code: string;
            rrn: string;
            three_d_secure: {
              applied: boolean;
              authentication_value?: string;
              challenge_completed?: boolean;
              ds_transaction_id?: string;
              eci?: string;
              method_completed?: boolean;
              protocol?: string;
              three_d_secure_server_transaction_id?: string;
              xid?: string;
            };
          };
          captured_at?: string;
          confirmation?: { confirmation_url: string; type: string };
          created_at?: string;
          description?: string;
          event?: string;
          id?: string;
          income_amount?: { currency: string; value: string };
          metadata?: Record<string, never>;
          mongoId?: string;
          object?: {
            amount: { currency: string; value: string };
            authorization_details: {
              auth_code: string;
              rrn: string;
              three_d_secure: {
                applied: boolean;
                challenge_completed: boolean;
                method_completed: boolean;
                protocol: string;
              };
            };
            captured_at: string;
            created_at: string;
            description: string;
            id: string;
            income_amount: { currency: string; value: string };
            metadata: Record<string, never>;
            paid: boolean;
            payment_method: {
              card: {
                card_product: { code: string; name: string };
                card_type: string;
                expiry_month: string;
                expiry_year: string;
                first6: string;
                issuer_country: string;
                issuer_name: string;
                last4: string;
              };
              id: string;
              saved: boolean;
              status: string;
              title: string;
              type: string;
            };
            receipt_registration: string;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            refunded_amount: { currency: string; value: string };
            status: string;
            test: boolean;
          };
          paid?: boolean;
          payment?: {
            amount: { currency: string; value: string };
            confirmation: { confirmation_url: string; type: string };
            created_at: string;
            description: string;
            id: string;
            metadata: Record<string, never>;
            paid: boolean;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            status: string;
            test: boolean;
          };
          payment_method?: {
            account_number?: string;
            card?: {
              card_product?: { code: string; name: string };
              card_type: string;
              expiry_month: string;
              expiry_year: string;
              first6: string;
              issuer_country?: string;
              issuer_name?: string;
              last4: string;
            };
            id: string;
            saved: boolean;
            status?: string;
            title?: string;
            type: string;
          };
          plan?: string;
          recipient?: { account_id: string; gateway_id: string };
          refundable?: boolean;
          refunded_amount?: { currency: string; value: string };
          status?: string;
          tariff?: string;
          test?: boolean;
          type?: string;
          user?: {
            email: string;
            fullName?: string;
            mongoId: string;
            phone: string;
          };
        } | null
      >;
      listByEmail: FunctionReference<
        "query",
        "public",
        { email: string },
        Array<{
          _creationTime: number;
          _id: Id<"payments">;
          amount?: { currency: string; value: string };
          authorization_details?: {
            auth_code: string;
            rrn: string;
            three_d_secure: {
              applied: boolean;
              authentication_value?: string;
              challenge_completed?: boolean;
              ds_transaction_id?: string;
              eci?: string;
              method_completed?: boolean;
              protocol?: string;
              three_d_secure_server_transaction_id?: string;
              xid?: string;
            };
          };
          captured_at?: string;
          confirmation?: { confirmation_url: string; type: string };
          created_at?: string;
          description?: string;
          event?: string;
          id?: string;
          income_amount?: { currency: string; value: string };
          metadata?: Record<string, never>;
          mongoId?: string;
          object?: {
            amount: { currency: string; value: string };
            authorization_details: {
              auth_code: string;
              rrn: string;
              three_d_secure: {
                applied: boolean;
                challenge_completed: boolean;
                method_completed: boolean;
                protocol: string;
              };
            };
            captured_at: string;
            created_at: string;
            description: string;
            id: string;
            income_amount: { currency: string; value: string };
            metadata: Record<string, never>;
            paid: boolean;
            payment_method: {
              card: {
                card_product: { code: string; name: string };
                card_type: string;
                expiry_month: string;
                expiry_year: string;
                first6: string;
                issuer_country: string;
                issuer_name: string;
                last4: string;
              };
              id: string;
              saved: boolean;
              status: string;
              title: string;
              type: string;
            };
            receipt_registration: string;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            refunded_amount: { currency: string; value: string };
            status: string;
            test: boolean;
          };
          paid?: boolean;
          payment?: {
            amount: { currency: string; value: string };
            confirmation: { confirmation_url: string; type: string };
            created_at: string;
            description: string;
            id: string;
            metadata: Record<string, never>;
            paid: boolean;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            status: string;
            test: boolean;
          };
          payment_method?: {
            account_number?: string;
            card?: {
              card_product?: { code: string; name: string };
              card_type: string;
              expiry_month: string;
              expiry_year: string;
              first6: string;
              issuer_country?: string;
              issuer_name?: string;
              last4: string;
            };
            id: string;
            saved: boolean;
            status?: string;
            title?: string;
            type: string;
          };
          plan?: string;
          recipient?: { account_id: string; gateway_id: string };
          refundable?: boolean;
          refunded_amount?: { currency: string; value: string };
          status?: string;
          tariff?: string;
          test?: boolean;
          type?: string;
          user?: {
            email: string;
            fullName?: string;
            mongoId: string;
            phone: string;
          };
        }>
      >;
      listByUser: FunctionReference<
        "query",
        "public",
        { userId: Id<"users"> },
        Array<{
          _creationTime: number;
          _id: Id<"payments">;
          amount?: { currency: string; value: string };
          authorization_details?: {
            auth_code: string;
            rrn: string;
            three_d_secure: {
              applied: boolean;
              authentication_value?: string;
              challenge_completed?: boolean;
              ds_transaction_id?: string;
              eci?: string;
              method_completed?: boolean;
              protocol?: string;
              three_d_secure_server_transaction_id?: string;
              xid?: string;
            };
          };
          captured_at?: string;
          confirmation?: { confirmation_url: string; type: string };
          created_at?: string;
          description?: string;
          event?: string;
          id?: string;
          income_amount?: { currency: string; value: string };
          metadata?: Record<string, never>;
          mongoId?: string;
          object?: {
            amount: { currency: string; value: string };
            authorization_details: {
              auth_code: string;
              rrn: string;
              three_d_secure: {
                applied: boolean;
                challenge_completed: boolean;
                method_completed: boolean;
                protocol: string;
              };
            };
            captured_at: string;
            created_at: string;
            description: string;
            id: string;
            income_amount: { currency: string; value: string };
            metadata: Record<string, never>;
            paid: boolean;
            payment_method: {
              card: {
                card_product: { code: string; name: string };
                card_type: string;
                expiry_month: string;
                expiry_year: string;
                first6: string;
                issuer_country: string;
                issuer_name: string;
                last4: string;
              };
              id: string;
              saved: boolean;
              status: string;
              title: string;
              type: string;
            };
            receipt_registration: string;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            refunded_amount: { currency: string; value: string };
            status: string;
            test: boolean;
          };
          paid?: boolean;
          payment?: {
            amount: { currency: string; value: string };
            confirmation: { confirmation_url: string; type: string };
            created_at: string;
            description: string;
            id: string;
            metadata: Record<string, never>;
            paid: boolean;
            recipient: { account_id: string; gateway_id: string };
            refundable: boolean;
            status: string;
            test: boolean;
          };
          payment_method?: {
            account_number?: string;
            card?: {
              card_product?: { code: string; name: string };
              card_type: string;
              expiry_month: string;
              expiry_year: string;
              first6: string;
              issuer_country?: string;
              issuer_name?: string;
              last4: string;
            };
            id: string;
            saved: boolean;
            status?: string;
            title?: string;
            type: string;
          };
          plan?: string;
          recipient?: { account_id: string; gateway_id: string };
          refundable?: boolean;
          refunded_amount?: { currency: string; value: string };
          status?: string;
          tariff?: string;
          test?: boolean;
          type?: string;
          user?: {
            email: string;
            fullName?: string;
            mongoId: string;
            phone: string;
          };
        }>
      >;
    };
    brochures: {
      list: FunctionReference<
        "query",
        "public",
        {
          admin_id?: string;
          app_visible?: boolean;
          forcePublish?: boolean;
          limit?: number;
          nozology?: string;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"brochures">;
            app_visible?: boolean;
            cover_image: string;
            idx?: number;
            mongoId?: string;
            name: string;
            nozology: Id<"nozologies"> | string;
            pdf_file: string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"brochures"> },
        {
          _creationTime: number;
          _id: Id<"brochures">;
          app_visible?: boolean;
          cover_image: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          pdf_file: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        } | null
      >;
      getByMongoId: FunctionReference<
        "query",
        "public",
        { mongoId: string },
        {
          _creationTime: number;
          _id: Id<"brochures">;
          app_visible?: boolean;
          cover_image: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          pdf_file: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          app_visible?: boolean;
          cover_image: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          pdf_file: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        },
        {
          _creationTime: number;
          _id: Id<"brochures">;
          app_visible?: boolean;
          cover_image: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          pdf_file: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            app_visible?: boolean;
            cover_image?: string;
            idx?: number;
            mongoId?: string;
            name?: string;
            nozology?: string;
            pdf_file?: string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
          };
          id: Id<"brochures">;
        },
        {
          _creationTime: number;
          _id: Id<"brochures">;
          app_visible?: boolean;
          cover_image: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          pdf_file: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"brochures"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          app_visible?: boolean;
          bunUrl?: string;
          cover: { base64: string; contentType: string };
          idx?: number;
          name: string;
          nozology: string;
          pdf: { base64: string; contentType: string };
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          token?: string;
        },
        {
          _creationTime: number;
          _id: Id<"brochures">;
          app_visible?: boolean;
          cover_image: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          pdf_file: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          app_visible?: boolean;
          cover?: { base64: string; contentType: string };
          id: Id<"brochures">;
          idx?: number;
          name?: string;
          nozology?: string;
          pdf?: { base64: string; contentType: string };
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        },
        {
          _creationTime: number;
          _id: Id<"brochures">;
          app_visible?: boolean;
          cover_image: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          pdf_file: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
        }
      >;
    };
    categories: {
      list: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          _creationTime: number;
          _id: Id<"categories">;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
          nozologiesCount: number;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"categories"> },
        {
          _creationTime: number;
          _id: Id<"categories">;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          cover_image?: string;
          description?: string;
          idx?: number;
          name: string;
        },
        {
          _creationTime: number;
          _id: Id<"categories">;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            cover_image?: string;
            description?: string;
            idx?: number;
            name?: string;
          };
          id: Id<"categories">;
        },
        {
          _creationTime: number;
          _id: Id<"categories">;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"categories"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          cover?: { base64: string; contentType: string };
          description?: string;
          name: string;
        },
        {
          _creationTime: number;
          _id: Id<"categories">;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          cover?: { base64: string; contentType: string };
          description?: string;
          id: Id<"categories">;
          name?: string;
        },
        {
          _creationTime: number;
          _id: Id<"categories">;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
        }
      >;
    };
    clinic_tasks: {
      addQuestionIds: FunctionReference<
        "mutation",
        "public",
        { batchSize?: number },
        { processed: number; totalQuestions: number; updated: number }
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          additional_info?: string;
          ai_scenario?: string;
          app_visible?: boolean;
          cover: { base64: string; contentType: string };
          description: string;
          difficulty: number;
          endoscopy_model?:
            | string
            | { base64: string; contentType: string }
            | null;
          endoscopy_modelPath?: string;
          endoscopy_video?:
            | string
            | { base64: string; contentType: string }
            | null;
          endoscopy_videoPath?: string;
          feedback: any;
          idx?: number;
          images?: Array<{
            image: string | { base64: string; contentType: string };
            is_open: boolean;
          }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          name: string;
          nozology: string;
          publishAfter?: number;
          questions: Array<any>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        },
        {
          _creationTime: number;
          _id: Id<"clinic_tasks">;
          additional_info: string;
          ai_scenario: string;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          difficulty: number;
          endoscopy_model?: string;
          endoscopy_video?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          images: Array<{ image: string; is_open: boolean }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            additional_info: string;
            answer: string;
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            id?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"clinic_tasks"> },
        {
          _creationTime: number;
          _id: Id<"clinic_tasks">;
          additional_info: string;
          ai_scenario: string;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          difficulty: number;
          endoscopy_model?: string;
          endoscopy_video?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          images: Array<{ image: string; is_open: boolean }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            additional_info: string;
            answer: string;
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            id?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        } | null
      >;
      getClinicTaskQuestionCondition: FunctionReference<
        "query",
        "public",
        { question_id: string; task_id: string },
        any | null
      >;
      getTask: FunctionReference<"query", "public", { task_id: string }, any>;
      getTaskAnswerDiagnosis: FunctionReference<
        "query",
        "public",
        { task_id: string },
        { answer: string }
      >;
      getTaskAnswerTreatment: FunctionReference<
        "query",
        "public",
        { task_id: string },
        { answer: string }
      >;
      getTaskCondition: FunctionReference<
        "query",
        "public",
        { task_id: string },
        { additional_info: string; ai_scenario: string }
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          additional_info: string;
          ai_scenario: string;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          difficulty: number;
          endoscopy_model?: string;
          endoscopy_video?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          images: Array<{ image: string; is_open: boolean }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            additional_info: string;
            answer: string;
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            id?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        },
        {
          _creationTime: number;
          _id: Id<"clinic_tasks">;
          additional_info: string;
          ai_scenario: string;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          difficulty: number;
          endoscopy_model?: string;
          endoscopy_video?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          images: Array<{ image: string; is_open: boolean }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            additional_info: string;
            answer: string;
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            id?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        }
      >;
      list: FunctionReference<
        "query",
        "public",
        {
          admin_id?: string;
          app_visible?: boolean;
          forcePublish?: boolean;
          limit?: number;
          nozology?: string;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"clinic_tasks">;
            additional_info: string;
            ai_scenario: string;
            app_visible?: boolean;
            cover_image: string;
            description: string;
            difficulty: number;
            endoscopy_model?: string;
            endoscopy_video?: string;
            feedback: Array<{
              analytic_questions: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
            }>;
            idx?: number;
            images: Array<{ image: string; is_open: boolean }>;
            interviewAnalyticQuestions?: Array<string>;
            interviewMode?: boolean;
            interviewQuestions?: Array<string>;
            mongoId?: string;
            name: string;
            nozology: Id<"nozologies"> | string;
            publishAfter?: number;
            questions: Array<{
              additional_info: string;
              answer: string;
              answers: Array<{ answer: string; isCorrect: boolean }>;
              correct_answer_comment: string;
              id?: string;
              question: string;
              type: string;
            }>;
            references?: Array<{ name: string | null; url: string }>;
            stars: number;
            timecodes?: Array<{
              description?: string;
              time: number;
              title: string;
            }>;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"clinic_tasks"> },
        boolean
      >;
      rewriteInterviewMode: FunctionReference<
        "mutation",
        "public",
        Record<string, never>,
        any
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            additional_info?: string;
            ai_scenario?: string;
            app_visible?: boolean;
            cover_image?: string;
            description?: string;
            difficulty?: number;
            endoscopy_model?: string | null;
            endoscopy_video?: string | null;
            feedback?: any;
            idx?: number;
            images?: Array<{ image: string; is_open: boolean }>;
            interviewAnalyticQuestions?: Array<string>;
            interviewMode?: boolean;
            interviewQuestions?: Array<string>;
            name?: string;
            nozology?: string;
            publishAfter?: number;
            questions?: Array<any>;
            references?: Array<{ name: string | null; url: string }>;
            stars?: number;
            timecodes?: Array<{
              description?: string;
              time: number;
              title: string;
            }>;
          };
          id: Id<"clinic_tasks">;
        },
        {
          _creationTime: number;
          _id: Id<"clinic_tasks">;
          additional_info: string;
          ai_scenario: string;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          difficulty: number;
          endoscopy_model?: string;
          endoscopy_video?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          images: Array<{ image: string; is_open: boolean }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            additional_info: string;
            answer: string;
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            id?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          additional_info?: string;
          ai_scenario?: string;
          app_visible?: boolean;
          cover?: { base64: string; contentType: string };
          description?: string;
          difficulty?: number;
          endoscopy_model?:
            | string
            | { base64: string; contentType: string }
            | null;
          endoscopy_modelPath?: string;
          endoscopy_video?:
            | string
            | { base64: string; contentType: string }
            | null;
          endoscopy_videoPath?: string;
          feedback?: any;
          id: Id<"clinic_tasks">;
          idx?: number;
          images?: Array<{
            image: string | { base64: string; contentType: string };
            is_open: boolean;
          }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          name?: string;
          nozology?: string;
          publishAfter?: number;
          questions?: Array<any>;
          references?: Array<{ name: string | null; url: string }>;
          stars?: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        },
        {
          _creationTime: number;
          _id: Id<"clinic_tasks">;
          additional_info: string;
          ai_scenario: string;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          difficulty: number;
          endoscopy_model?: string;
          endoscopy_video?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          images: Array<{ image: string; is_open: boolean }>;
          interviewAnalyticQuestions?: Array<string>;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            additional_info: string;
            answer: string;
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            id?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          timecodes?: Array<{
            description?: string;
            time: number;
            title: string;
          }>;
        }
      >;
    };
    companies: {
      list: FunctionReference<
        "query",
        "public",
        {
          id?: string;
          limit?: number;
          page?: number;
          search?: string;
          slug?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"companies">;
            created_at: string;
            dashboards: Array<{
              dashboardPercent?: number;
              icon: string;
              name: string;
              stats: Array<{
                graphics: Array<{
                  cols: number;
                  type: "line" | "bar" | "pie" | "area" | "table";
                }>;
                name: string;
                question_id: string;
                scaleAll: number;
                scales: Array<{
                  autoscale?: {
                    enabled: boolean;
                    extremum: number;
                    max_step: number;
                    min_step: number;
                  };
                  name: string;
                  scaleDistribution?: number;
                  type: "linear" | "multiple";
                  value: number;
                }>;
              }>;
            }>;
            description: string;
            isActive?: boolean;
            logo: string;
            maxGrowth?: number;
            minGrowth?: number;
            mongoId?: string;
            name: string;
            password: string;
            slug: string;
            totalGrowth?: number;
            updated_at: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: string },
        {
          _creationTime: number;
          _id: Id<"companies">;
          created_at: string;
          dashboards: Array<{
            dashboardPercent?: number;
            icon: string;
            name: string;
            stats: Array<{
              graphics: Array<{
                cols: number;
                type: "line" | "bar" | "pie" | "area" | "table";
              }>;
              name: string;
              question_id: string;
              scaleAll: number;
              scales: Array<{
                autoscale?: {
                  enabled: boolean;
                  extremum: number;
                  max_step: number;
                  min_step: number;
                };
                name: string;
                scaleDistribution?: number;
                type: "linear" | "multiple";
                value: number;
              }>;
            }>;
          }>;
          description: string;
          isActive?: boolean;
          logo: string;
          maxGrowth?: number;
          minGrowth?: number;
          mongoId?: string;
          name: string;
          password: string;
          slug: string;
          totalGrowth?: number;
          updated_at: string;
        } | null
      >;
      getBySlug: FunctionReference<
        "query",
        "public",
        { slug: string },
        {
          _creationTime: number;
          _id: Id<"companies">;
          created_at: string;
          dashboards: Array<{
            dashboardPercent?: number;
            icon: string;
            name: string;
            stats: Array<{
              graphics: Array<{
                cols: number;
                type: "line" | "bar" | "pie" | "area" | "table";
              }>;
              name: string;
              question_id: string;
              scaleAll: number;
              scales: Array<{
                autoscale?: {
                  enabled: boolean;
                  extremum: number;
                  max_step: number;
                  min_step: number;
                };
                name: string;
                scaleDistribution?: number;
                type: "linear" | "multiple";
                value: number;
              }>;
            }>;
          }>;
          description: string;
          isActive?: boolean;
          logo: string;
          maxGrowth?: number;
          minGrowth?: number;
          mongoId?: string;
          name: string;
          password: string;
          slug: string;
          totalGrowth?: number;
          updated_at: string;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          created_at: string;
          dashboards: Array<{
            dashboardPercent?: number;
            icon: string;
            name: string;
            stats: Array<{
              graphics: Array<{
                cols: number;
                type: "line" | "bar" | "pie" | "area" | "table";
              }>;
              name: string;
              question_id: string;
              scaleAll: number;
              scales: Array<{
                autoscale?: {
                  enabled: boolean;
                  extremum: number;
                  max_step: number;
                  min_step: number;
                };
                name: string;
                scaleDistribution?: number;
                type: "linear" | "multiple";
                value: number;
              }>;
            }>;
          }>;
          description: string;
          isActive?: boolean;
          logo: string;
          maxGrowth?: number;
          minGrowth?: number;
          mongoId?: string;
          name: string;
          password: string;
          slug: string;
          totalGrowth?: number;
          updated_at: string;
        },
        {
          _creationTime: number;
          _id: Id<"companies">;
          created_at: string;
          dashboards: Array<{
            dashboardPercent?: number;
            icon: string;
            name: string;
            stats: Array<{
              graphics: Array<{
                cols: number;
                type: "line" | "bar" | "pie" | "area" | "table";
              }>;
              name: string;
              question_id: string;
              scaleAll: number;
              scales: Array<{
                autoscale?: {
                  enabled: boolean;
                  extremum: number;
                  max_step: number;
                  min_step: number;
                };
                name: string;
                scaleDistribution?: number;
                type: "linear" | "multiple";
                value: number;
              }>;
            }>;
          }>;
          description: string;
          isActive?: boolean;
          logo: string;
          maxGrowth?: number;
          minGrowth?: number;
          mongoId?: string;
          name: string;
          password: string;
          slug: string;
          totalGrowth?: number;
          updated_at: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            _creationTime?: number;
            _id?: Id<"companies">;
            created_at?: string;
            dashboards?: Array<{
              dashboardPercent?: number;
              icon: string;
              name: string;
              stats: Array<{
                graphics: Array<{
                  cols: number;
                  type: "line" | "bar" | "pie" | "area" | "table";
                }>;
                name: string;
                question_id: string;
                scaleAll: number;
                scales: Array<{
                  autoscale?: {
                    enabled: boolean;
                    extremum: number;
                    max_step: number;
                    min_step: number;
                  };
                  name: string;
                  scaleDistribution?: number;
                  type: "linear" | "multiple";
                  value: number;
                }>;
              }>;
            }>;
            description?: string;
            isActive?: boolean;
            logo?: string;
            maxGrowth?: number;
            minGrowth?: number;
            mongoId?: string;
            name?: string;
            password?: string;
            slug?: string;
            totalGrowth?: number;
            updated_at?: string;
          };
          id: Id<"companies">;
        },
        {
          _creationTime: number;
          _id: Id<"companies">;
          created_at: string;
          dashboards: Array<{
            dashboardPercent?: number;
            icon: string;
            name: string;
            stats: Array<{
              graphics: Array<{
                cols: number;
                type: "line" | "bar" | "pie" | "area" | "table";
              }>;
              name: string;
              question_id: string;
              scaleAll: number;
              scales: Array<{
                autoscale?: {
                  enabled: boolean;
                  extremum: number;
                  max_step: number;
                  min_step: number;
                };
                name: string;
                scaleDistribution?: number;
                type: "linear" | "multiple";
                value: number;
              }>;
            }>;
          }>;
          description: string;
          isActive?: boolean;
          logo: string;
          maxGrowth?: number;
          minGrowth?: number;
          mongoId?: string;
          name: string;
          password: string;
          slug: string;
          totalGrowth?: number;
          updated_at: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"companies"> },
        boolean
      >;
    };
    drsarha_education_conversations: {
      list: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; task_id?: string; user_id?: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"drsarha_education_conversations">;
            created_at: string;
            message: string;
            mongoId?: string;
            role: string;
            task_id: Id<"clinic_tasks"> | string;
            user_id: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"drsarha_education_conversations"> },
        {
          _creationTime: number;
          _id: Id<"drsarha_education_conversations">;
          created_at: string;
          message: string;
          mongoId?: string;
          role: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          created_at: string;
          message: string;
          mongoId?: string;
          role: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        },
        {
          _creationTime: number;
          _id: Id<"drsarha_education_conversations">;
          created_at: string;
          message: string;
          mongoId?: string;
          role: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            created_at?: string;
            message?: string;
            role?: string;
            task_id?: string;
            user_id?: string;
          };
          id: Id<"drsarha_education_conversations">;
        },
        {
          _creationTime: number;
          _id: Id<"drsarha_education_conversations">;
          created_at: string;
          message: string;
          mongoId?: string;
          role: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"drsarha_education_conversations"> },
        boolean
      >;
      pushMessage: FunctionReference<
        "mutation",
        "public",
        {
          created_at?: string;
          message: string;
          role: string;
          task_id: string;
          user_id: string;
        },
        {
          _creationTime: number;
          _id: Id<"drsarha_education_conversations">;
          created_at: string;
          message: string;
          mongoId?: string;
          role: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        }
      >;
      getConversation: FunctionReference<
        "query",
        "public",
        { task_id: string; user_id: string },
        Array<{
          created_at: string;
          message: string;
          role: string;
          task_id: string;
          user_id: string;
        }>
      >;
    };
    drsarha_help_conversations: {
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"drsarha_help_conversations"> },
        {
          _creationTime: number;
          _id: Id<"drsarha_help_conversations">;
          comment: string;
          correct_answer: string;
          created_at: string;
          invalid_user_answer: string;
          messages: Array<{
            created_at: string;
            message: string;
            role: string;
          }>;
          mongoId?: string;
          question_id: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        } | null
      >;
      getHelpConversation: FunctionReference<
        "query",
        "public",
        { question_id: string; task_id: string; user_id: string },
        {
          comment: string;
          correct_answer: string;
          created_at: string;
          invalid_user_answer: string;
          messages: Array<{
            created_at: string;
            message: string;
            role: string;
          }>;
          question_id: string;
          task_id: string;
          user_id: string;
        } | null
      >;
      getHelpConversationMessages: FunctionReference<
        "query",
        "public",
        { question_id: string; task_id: string; user_id: string },
        Array<{ created_at: string; message: string; role: string }>
      >;
      initHelpConversation: FunctionReference<
        "mutation",
        "public",
        {
          comment?: string;
          correct_answer?: string;
          created_at?: string;
          invalid_user_answer?: string;
          messages?: Array<{
            created_at?: string;
            message: string;
            role: string;
          }>;
          question_id: string;
          task_id: string;
          user_id: string;
        },
        {
          attempt: number;
          conversation: {
            _creationTime: number;
            _id: Id<"drsarha_help_conversations">;
            comment: string;
            correct_answer: string;
            created_at: string;
            invalid_user_answer: string;
            messages: Array<{
              created_at: string;
              message: string;
              role: string;
            }>;
            mongoId?: string;
            question_id: string;
            task_id: Id<"clinic_tasks"> | string;
            user_id: Id<"users"> | string;
          };
        }
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          comment: string;
          correct_answer: string;
          created_at: string;
          invalid_user_answer: string;
          messages: Array<{
            created_at: string;
            message: string;
            role: string;
          }>;
          mongoId?: string;
          question_id: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        },
        {
          _creationTime: number;
          _id: Id<"drsarha_help_conversations">;
          comment: string;
          correct_answer: string;
          created_at: string;
          invalid_user_answer: string;
          messages: Array<{
            created_at: string;
            message: string;
            role: string;
          }>;
          mongoId?: string;
          question_id: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        }
      >;
      list: FunctionReference<
        "query",
        "public",
        {
          limit?: number;
          page?: number;
          question_id?: string;
          task_id?: string;
          user_id?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"drsarha_help_conversations">;
            comment: string;
            correct_answer: string;
            created_at: string;
            invalid_user_answer: string;
            messages: Array<{
              created_at: string;
              message: string;
              role: string;
            }>;
            mongoId?: string;
            question_id: string;
            task_id: Id<"clinic_tasks"> | string;
            user_id: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      pushMessageToHelpConversation: FunctionReference<
        "mutation",
        "public",
        {
          created_at?: string;
          message: string;
          question_id: string;
          role: string;
          task_id: string;
          user_id: string;
        },
        {
          _creationTime: number;
          _id: Id<"drsarha_help_conversations">;
          comment: string;
          correct_answer: string;
          created_at: string;
          invalid_user_answer: string;
          messages: Array<{
            created_at: string;
            message: string;
            role: string;
          }>;
          mongoId?: string;
          question_id: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"drsarha_help_conversations"> },
        boolean
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            comment?: string;
            correct_answer?: string;
            created_at?: string;
            invalid_user_answer?: string;
            messages?: Array<{
              created_at?: string;
              message: string;
              role: string;
            }>;
            question_id?: string;
            task_id?: string;
            user_id?: string;
          };
          id: Id<"drsarha_help_conversations">;
        },
        {
          _creationTime: number;
          _id: Id<"drsarha_help_conversations">;
          comment: string;
          correct_answer: string;
          created_at: string;
          invalid_user_answer: string;
          messages: Array<{
            created_at: string;
            message: string;
            role: string;
          }>;
          mongoId?: string;
          question_id: string;
          task_id: Id<"clinic_tasks"> | string;
          user_id: Id<"users"> | string;
        }
      >;
    };
    interactive_matches: {
      list: FunctionReference<
        "query",
        "public",
        {
          admin_id?: string;
          app_visible?: boolean;
          forcePublish?: boolean;
          limit?: number;
          nozology?: string;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"interactive_matches">;
            answers: Array<string>;
            app_visible?: boolean;
            available_errors: number;
            cover_image: string;
            created_at: string;
            feedback: Array<{
              analytic_questions: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
            }>;
            idx?: number;
            interviewMode?: boolean;
            interviewQuestions?: Array<string>;
            mongoId?: string;
            name: string;
            nozology: Id<"nozologies"> | string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
            stars: number;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"interactive_matches"> },
        {
          _creationTime: number;
          _id: Id<"interactive_matches">;
          answers: Array<string>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          created_at: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          answers: Array<string>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          created_at: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_matches">;
          answers: Array<string>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          created_at: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            answers?: Array<string>;
            app_visible?: boolean;
            available_errors?: number;
            cover_image?: string;
            feedback?: any;
            idx?: number;
            name?: string;
            nozology?: string;
            publishAfter?: number;
            references?: Array<{ name: string | null; url: string }>;
            stars?: number;
          };
          id: Id<"interactive_matches">;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_matches">;
          answers: Array<string>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          created_at: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"interactive_matches"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          answers: Array<string>;
          app_visible?: boolean;
          available_errors: number;
          cover: { base64: string; contentType: string };
          feedback: any;
          idx?: number;
          name: string;
          nozology: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_matches">;
          answers: Array<string>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          created_at: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          answers?: Array<string>;
          app_visible?: boolean;
          available_errors?: number;
          cover?: { base64: string; contentType: string };
          feedback?: any;
          id: Id<"interactive_matches">;
          idx?: number;
          name?: string;
          nozology?: string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars?: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_matches">;
          answers: Array<string>;
          app_visible?: boolean;
          available_errors: number;
          cover_image: string;
          created_at: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          interviewMode?: boolean;
          interviewQuestions?: Array<string>;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        }
      >;
    };
    interactive_quizzes: {
      list: FunctionReference<
        "query",
        "public",
        {
          admin_id?: string;
          app_visible?: boolean;
          forcePublish?: boolean;
          limit?: number;
          nozology?: string;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"interactive_quizzes">;
            app_visible?: boolean;
            available_errors: number;
            correct_answer_comment?: null | string;
            cover_image: string;
            created_at?: string;
            feedback: Array<{
              analytic_questions: Array<string>;
              answers: Array<{ answer: string; is_correct: boolean }>;
              has_correct: boolean;
              question: string;
            }>;
            idx?: number;
            mongoId?: string;
            name: string;
            nozology: Id<"nozologies"> | string;
            publishAfter?: number;
            questions: Array<{
              answers: Array<{ answer: string; isCorrect: boolean }>;
              correct_answer_comment: string;
              image?: string;
              question: string;
              type: string;
            }>;
            references?: Array<{ name: string | null; url: string }>;
            stars: number;
            updated_at?: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"interactive_quizzes"> },
        {
          _creationTime: number;
          _id: Id<"interactive_quizzes">;
          app_visible?: boolean;
          available_errors: number;
          correct_answer_comment?: null | string;
          cover_image: string;
          created_at?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            image?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          updated_at?: string;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          app_visible?: boolean;
          available_errors: number;
          correct_answer_comment?: null | string;
          cover_image: string;
          created_at?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            image?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          updated_at?: string;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_quizzes">;
          app_visible?: boolean;
          available_errors: number;
          correct_answer_comment?: null | string;
          cover_image: string;
          created_at?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            image?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          updated_at?: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            app_visible?: boolean;
            available_errors?: number;
            correct_answer_comment?: string | null;
            cover_image?: string;
            feedback?: any;
            idx?: number;
            name?: string;
            nozology?: string;
            publishAfter?: number;
            questions?: Array<any>;
            references?: Array<{ name: string | null; url: string }>;
            stars?: number;
          };
          id: Id<"interactive_quizzes">;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_quizzes">;
          app_visible?: boolean;
          available_errors: number;
          correct_answer_comment?: null | string;
          cover_image: string;
          created_at?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            image?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          updated_at?: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"interactive_quizzes"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          app_visible?: boolean;
          available_errors: number;
          correct_answer_comment?: string;
          cover: { base64: string; contentType: string };
          feedback: any;
          idx?: number;
          name: string;
          nozology: string;
          publishAfter?: number;
          questions: Array<any>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_quizzes">;
          app_visible?: boolean;
          available_errors: number;
          correct_answer_comment?: null | string;
          cover_image: string;
          created_at?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            image?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          updated_at?: string;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          app_visible?: boolean;
          available_errors?: number;
          correct_answer_comment?: string;
          cover?: { base64: string; contentType: string };
          feedback?: any;
          id: Id<"interactive_quizzes">;
          idx?: number;
          name?: string;
          nozology?: string;
          publishAfter?: number;
          questions?: Array<any>;
          references?: Array<{ name: string | null; url: string }>;
          stars?: number;
        },
        {
          _creationTime: number;
          _id: Id<"interactive_quizzes">;
          app_visible?: boolean;
          available_errors: number;
          correct_answer_comment?: null | string;
          cover_image: string;
          created_at?: string;
          feedback: Array<{
            analytic_questions: Array<string>;
            answers: Array<{ answer: string; is_correct: boolean }>;
            has_correct: boolean;
            question: string;
          }>;
          idx?: number;
          mongoId?: string;
          name: string;
          nozology: Id<"nozologies"> | string;
          publishAfter?: number;
          questions: Array<{
            answers: Array<{ answer: string; isCorrect: boolean }>;
            correct_answer_comment: string;
            image?: string;
            question: string;
            type: string;
          }>;
          references?: Array<{ name: string | null; url: string }>;
          stars: number;
          updated_at?: string;
        }
      >;
    };
    auth: {
      forgotPassword: FunctionReference<
        "action",
        "public",
        { email: string },
        { error?: string; message: string }
      >;
      login: FunctionReference<
        "action",
        "public",
        { email: string; password: string; userAgent?: string },
        {
          message: string;
          status?: number;
          token?: string;
          user?: {
            educationPassed?: boolean;
            email: string;
            exp: number;
            subscribeTill: string;
            tariff: string;
            userId: string;
          };
        }
      >;
      resetPassword: FunctionReference<
        "action",
        "public",
        { code: string; email: string; newPassword: string },
        { message: string }
      >;
      register: FunctionReference<
        "action",
        "public",
        {
          city?: string;
          diploma?: string;
          email: string;
          fullName?: string;
          isPediatric?: boolean;
          isScientific?: boolean;
          password: string;
          phone: string;
          plan: string;
          position?: string;
          privateClinic?: boolean;
          refererId?: string;
          specialization?: string;
          telegram?: string;
          workplace?: string;
        },
        { message: string; status?: number; token?: string; userId?: string }
      >;
    };
    user_saved_knowledge: {
      getByUser: FunctionReference<
        "query",
        "public",
        { userId: string },
        {
          _creationTime: number;
          _id: Id<"user_saved_knowledge">;
          knowledge: Array<{ id: string; type: string }>;
          mongoId?: string;
          user_id: null | string;
        } | null
      >;
      saveKnowledge: FunctionReference<
        "mutation",
        "public",
        { knowledgeId: string; type: string; userId: string },
        { message: string; success: boolean }
      >;
      getUserKnowledge: FunctionReference<
        "query",
        "public",
        { userId: string },
        { saved_knowledge: Array<{ id: string; type: string }> }
      >;
      getUserKnowledgeFull: FunctionReference<
        "query",
        "public",
        { userId: string },
        { saved_knowledge: Array<any> }
      >;
      deleteKnowledge: FunctionReference<
        "mutation",
        "public",
        { knowledgeId: string; type: string; userId: string },
        { message: string; success: boolean }
      >;
    };
    folders: {
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"folders"> },
        {
          _creationTime: number;
          _id: Id<"folders">;
          collaboratorsCount: number;
          createdAt?: string;
          description: string;
          isPrivate: boolean | string;
          mongoId?: string;
          name: string;
          ownerId: Id<"users"> | string;
          postsCount: number;
          updatedAt: string;
        } | null
      >;
      getUserFolders: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; userId: Id<"users"> },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"folders">;
            collaboratorsCount: number;
            createdAt?: string;
            description: string;
            isPrivate: boolean | string;
            mongoId?: string;
            name: string;
            ownerId: Id<"users"> | string;
            postsCount: number;
            updatedAt: string;
            userRole: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          description: string;
          isPrivate?: boolean | string;
          name: string;
          ownerId: Id<"users">;
        },
        {
          _creationTime: number;
          _id: Id<"folders">;
          collaboratorsCount: number;
          createdAt?: string;
          description: string;
          isPrivate: boolean | string;
          mongoId?: string;
          name: string;
          ownerId: Id<"users"> | string;
          postsCount: number;
          updatedAt: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"folders">;
          patch: {
            description?: string;
            isPrivate?: boolean | string;
            name?: string;
          };
        },
        {
          _creationTime: number;
          _id: Id<"folders">;
          collaboratorsCount: number;
          createdAt?: string;
          description: string;
          isPrivate: boolean | string;
          mongoId?: string;
          name: string;
          ownerId: Id<"users"> | string;
          postsCount: number;
          updatedAt: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"folders"> },
        boolean
      >;
      checkAccess: FunctionReference<
        "query",
        "public",
        { folderId: Id<"folders">; userId: Id<"users"> },
        {
          permissions: {
            canAddPins: boolean;
            canDeleteFolder: boolean;
            canEditFolder: boolean;
            canInviteUsers: boolean;
            canRemoveAnyPin: boolean;
            canRemovePins: boolean;
            canRemoveUsers: boolean;
          };
          role: string;
        } | null
      >;
      acceptInvitation: FunctionReference<
        "mutation",
        "public",
        { folderId: Id<"folders">; userId: Id<"users"> },
        boolean
      >;
      savePin: FunctionReference<
        "mutation",
        "public",
        { folderId: Id<"folders">; pinId: Id<"pins">; userId: Id<"users"> },
        {
          _creationTime: number;
          _id: Id<"saved_pins">;
          folderId: Id<"folders"> | string;
          mongoId?: string;
          pinId: Id<"pins"> | string;
          savedAt: string;
          userId: Id<"users"> | string;
        }
      >;
      removePin: FunctionReference<
        "mutation",
        "public",
        { folderId: Id<"folders">; pinId: Id<"pins">; userId: Id<"users"> },
        boolean
      >;
      getFolderPins: FunctionReference<
        "query",
        "public",
        { folderId: Id<"folders">; limit?: number; page?: number },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"saved_pins">;
            commentsCount?: number;
            folderId: Id<"folders"> | string;
            mongoId?: string;
            pin?: any;
            pinId: Id<"pins"> | string;
            savedAt: string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getCollaborators: FunctionReference<
        "query",
        "public",
        { folderId: Id<"folders"> },
        Array<{
          _creationTime: number;
          _id: Id<"folder_collaborators">;
          folderId: Id<"folders"> | string;
          invitedBy?: Id<"users"> | string;
          joinedAt: string;
          mongoId?: string;
          role: "owner" | "collaborator" | string;
          status: "active" | "invited" | string;
          userId: Id<"users"> | string;
        }>
      >;
      checkPinSaved: FunctionReference<
        "query",
        "public",
        { folderId: Id<"folders">; pinId: Id<"pins"> },
        boolean
      >;
      getSavedPinsByPinId: FunctionReference<
        "query",
        "public",
        { pinId: Id<"pins"> },
        Array<{
          _creationTime: number;
          _id: Id<"saved_pins">;
          folderId: Id<"folders"> | string;
          mongoId?: string;
          pinId: Id<"pins"> | string;
          savedAt: string;
          userId: Id<"users"> | string;
        }>
      >;
      removePinFromAllFolders: FunctionReference<
        "mutation",
        "public",
        { pinId: Id<"pins"> },
        number
      >;
      getFolderStats: FunctionReference<
        "query",
        "public",
        { folderId: Id<"folders"> },
        {
          authorsCount: number;
          firstThreePinsImages: Array<string>;
          pinsCount: number;
        }
      >;
    };
    admin_users: {
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"admin_users"> },
        {
          _creationTime: number;
          _id: Id<"admin_users">;
          createdAt?: string;
          email: string;
          mongoId?: string;
          name: string;
          password: string;
          role: "admin" | "moderator";
          updatedAt: string;
        } | null
      >;
      getByEmail: FunctionReference<
        "query",
        "public",
        { email: string },
        {
          _creationTime: number;
          _id: Id<"admin_users">;
          createdAt?: string;
          email: string;
          mongoId?: string;
          name: string;
          password: string;
          role: "admin" | "moderator";
          updatedAt: string;
        } | null
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          email: string;
          mongoId?: string;
          name: string;
          password: string;
          role: "admin" | "moderator";
        },
        {
          _creationTime: number;
          _id: Id<"admin_users">;
          createdAt?: string;
          email: string;
          mongoId?: string;
          name: string;
          password: string;
          role: "admin" | "moderator";
          updatedAt: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          id: Id<"admin_users">;
          patch: {
            email?: string;
            name?: string;
            password?: string;
            role?: "admin" | "moderator";
          };
        },
        {
          _creationTime: number;
          _id: Id<"admin_users">;
          createdAt?: string;
          email: string;
          mongoId?: string;
          name: string;
          password: string;
          role: "admin" | "moderator";
          updatedAt: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"admin_users"> },
        boolean
      >;
      getAll: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        Array<{
          _creationTime: number;
          _id: Id<"admin_users">;
          createdAt?: string;
          email: string;
          mongoId?: string;
          name: string;
          password: string;
          role: "admin" | "moderator";
          updatedAt: string;
        }>
      >;
      countAdmins: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        number
      >;
    };
    ai_verifications: {
      getAiVerification: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        {
          description: string;
          images: Array<{ _id: string; image: string }>;
          title: string;
        }
      >;
      createAiVerificationResponse: FunctionReference<
        "mutation",
        "public",
        {
          pinId: Id<"pins"> | string;
          userAnswer: { description: string; title: string };
          userId: Id<"users"> | string;
        },
        { _id: Id<"ai_verifications">; isCorrect: boolean }
      >;
    };
    clinic_atlases: {
      getAll: FunctionReference<
        "query",
        "public",
        {
          byRate?: boolean;
          id?: string;
          limit?: number;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"clinic_atlases_test">;
            comments: Array<string>;
            coverImage?: string;
            createdAt?: string;
            description: string;
            images: Array<
              string | { description: string; image: string; title: string }
            >;
            likes: Array<string>;
            mongoId?: string;
            name: string;
            tags: Array<string>;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"clinic_atlases_test"> },
        {
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        } | null
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          coverImage: string;
          description: string;
          images: Array<{ description: string; image: string; title: string }>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        },
        {
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            coverImage?: string;
            description?: string;
            images?: Array<{
              description: string;
              image: string;
              title: string;
            }>;
            name?: string;
            tags?: Array<string>;
          };
          id: Id<"clinic_atlases_test">;
        },
        {
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"clinic_atlases_test"> },
        boolean
      >;
      addLike: FunctionReference<
        "mutation",
        "public",
        { id: Id<"clinic_atlases_test">; userId: string },
        {
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }
      >;
      removeLike: FunctionReference<
        "mutation",
        "public",
        { id: Id<"clinic_atlases_test">; userId: string },
        {
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }
      >;
      addComment: FunctionReference<
        "mutation",
        "public",
        { commentId: string; id: Id<"clinic_atlases_test"> },
        {
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }
      >;
      removeComment: FunctionReference<
        "mutation",
        "public",
        { commentId: string; id: Id<"clinic_atlases_test"> },
        {
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }
      >;
      searchByName: FunctionReference<
        "query",
        "public",
        { name: string },
        Array<{
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }>
      >;
      findSimilar: FunctionReference<
        "query",
        "public",
        { id: Id<"clinic_atlases_test"> },
        Array<{
          _creationTime: number;
          _id: Id<"clinic_atlases_test">;
          comments: Array<string>;
          coverImage?: string;
          createdAt?: string;
          description: string;
          images: Array<
            string | { description: string; image: string; title: string }
          >;
          likes: Array<string>;
          mongoId?: string;
          name: string;
          tags: Array<string>;
        }>
      >;
    };
    collaboration_requests: {
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"collaboration_requests"> },
        {
          _creationTime: number;
          _id: Id<"collaboration_requests">;
          createdAt?: string;
          expiresAt: string;
          folderId: Id<"folders"> | string;
          inviteeId: Id<"users"> | string;
          inviterId: Id<"users"> | string;
          message?: string;
          mongoId?: string;
          status: "pending" | "accepted" | "declined" | "expired";
          updatedAt: string;
        } | null
      >;
      createRequest: FunctionReference<
        "mutation",
        "public",
        {
          expiresInDays?: number;
          folderId: Id<"folders">;
          inviteeId: Id<"users">;
          inviterId: Id<"users">;
          message?: string;
        },
        {
          _creationTime: number;
          _id: Id<"collaboration_requests">;
          createdAt?: string;
          expiresAt: string;
          folderId: Id<"folders"> | string;
          inviteeId: Id<"users"> | string;
          inviterId: Id<"users"> | string;
          message?: string;
          mongoId?: string;
          status: "pending" | "accepted" | "declined" | "expired";
          updatedAt: string;
        }
      >;
      getUserIncomingRequests: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; userId: Id<"users"> },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"collaboration_requests">;
            createdAt?: string;
            expiresAt: string;
            folder?: any;
            folderId: Id<"folders"> | string;
            inviteeId: Id<"users"> | string;
            inviter?: any;
            inviterId: Id<"users"> | string;
            message?: string;
            mongoId?: string;
            status: "pending" | "accepted" | "declined" | "expired";
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getUserOutgoingRequests: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; userId: Id<"users"> },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"collaboration_requests">;
            createdAt?: string;
            expiresAt: string;
            folder?: any;
            folderId: Id<"folders"> | string;
            invitee?: any;
            inviteeId: Id<"users"> | string;
            inviterId: Id<"users"> | string;
            message?: string;
            mongoId?: string;
            status: "pending" | "accepted" | "declined" | "expired";
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      acceptRequest: FunctionReference<
        "mutation",
        "public",
        { requestId: Id<"collaboration_requests">; userId: Id<"users"> },
        boolean
      >;
      declineRequest: FunctionReference<
        "mutation",
        "public",
        { requestId: Id<"collaboration_requests">; userId: Id<"users"> },
        boolean
      >;
      revokeRequest: FunctionReference<
        "mutation",
        "public",
        { inviterId: Id<"users">; requestId: Id<"collaboration_requests"> },
        boolean
      >;
      cleanupExpiredRequests: FunctionReference<
        "mutation",
        "public",
        Record<string, never>,
        number
      >;
      getFolderRequests: FunctionReference<
        "query",
        "public",
        {
          folderId: Id<"folders">;
          limit?: number;
          page?: number;
          status?: "pending" | "accepted" | "declined" | "expired";
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"collaboration_requests">;
            createdAt?: string;
            expiresAt: string;
            folderId: Id<"folders"> | string;
            invitee?: any;
            inviteeId: Id<"users"> | string;
            inviter?: any;
            inviterId: Id<"users"> | string;
            message?: string;
            mongoId?: string;
            status: "pending" | "accepted" | "declined" | "expired";
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getUserRequestsStats: FunctionReference<
        "query",
        "public",
        { userId: Id<"users"> },
        {
          incoming: { pending: number; total: number };
          outgoing: {
            accepted: number;
            declined: number;
            pending: number;
            total: number;
          };
        }
      >;
    };
    help_tickets: {
      createHelpTicket: FunctionReference<
        "mutation",
        "public",
        { email: string; name: string; phone: string; subject: string },
        {
          _creationTime: number;
          _id: Id<"help_tickets">;
          createdAt?: string;
          email: string;
          mongoId?: string;
          name: string;
          phone: string;
          subject: string;
        }
      >;
    };
    admin_users_actions: {
      authenticate: FunctionReference<
        "action",
        "public",
        { email: string; password: string },
        {
          _creationTime: number;
          _id: Id<"admin_users">;
          createdAt?: string;
          email: string;
          mongoId?: string;
          name: string;
          password: string;
          role: "admin" | "moderator";
          updatedAt: string;
        } | null
      >;
      hashPasswordAction: FunctionReference<
        "action",
        "public",
        { password: string },
        string
      >;
      login: FunctionReference<
        "action",
        "public",
        { email: string; password: string },
        {
          adminUser?: {
            adminId: string;
            email: string;
            exp: number;
            name: string;
            role: string;
          };
          message: string;
          status?: number;
          token?: string;
        }
      >;
    };
    user_bans: {
      create: FunctionReference<
        "mutation",
        "public",
        { bannedUserId: string; userId: string },
        {
          _creationTime: number;
          _id: Id<"user_bans">;
          bannedUserId: Id<"users"> | string;
          createdAt?: string;
          mongoId?: string;
          userId: Id<"users"> | string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { bannedUserId: string; userId: string },
        boolean
      >;
      list: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; userId: string },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"user_bans">;
            bannedUserId: Id<"users"> | string;
            createdAt?: string;
            mongoId?: string;
            userId: Id<"users"> | string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
    };
    pin_comment_reports: {
      createReport: FunctionReference<
        "mutation",
        "public",
        {
          comment: string;
          commentAuthorId: string;
          commentId: string;
          pinId: string;
          reporterId: string;
          typeId: string;
        },
        {
          _creationTime: number;
          _id: Id<"pin_comment_reports">;
          admin_comment?: string;
          comment: string;
          commentAuthor: Id<"users"> | string;
          commentId: Id<"pin_comments"> | string;
          createdAt?: string;
          fine: number;
          mongoId?: string;
          pinId: Id<"pins"> | string;
          reporter: Id<"users"> | string;
          reward: number;
          status: "new" | "approved" | "rejected";
          type: Id<"pin_report_type"> | string;
          updatedAt: string;
        }
      >;
      listReports: FunctionReference<
        "query",
        "public",
        {
          commentAuthorId?: string;
          commentId?: string;
          limit?: number;
          page?: number;
          pinId?: string;
          reporterId?: string;
          status?: "new" | "approved" | "rejected";
          typeId?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"pin_comment_reports">;
            admin_comment?: string;
            comment: string;
            commentAuthor: Id<"users"> | string;
            commentId: Id<"pin_comments"> | string;
            createdAt?: string;
            fine: number;
            mongoId?: string;
            pinId: Id<"pins"> | string;
            reporter: Id<"users"> | string;
            reward: number;
            status: "new" | "approved" | "rejected";
            type: Id<"pin_report_type"> | string;
            updatedAt: string;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"pin_comment_reports"> },
        {
          _creationTime: number;
          _id: Id<"pin_comment_reports">;
          admin_comment?: string;
          comment: string;
          commentAuthor: Id<"users"> | string;
          commentId: Id<"pin_comments"> | string;
          createdAt?: string;
          fine: number;
          mongoId?: string;
          pinId: Id<"pins"> | string;
          reporter: Id<"users"> | string;
          reward: number;
          status: "new" | "approved" | "rejected";
          type: Id<"pin_report_type"> | string;
          updatedAt: string;
        } | null
      >;
      setStatus: FunctionReference<
        "mutation",
        "public",
        {
          admin_comment: string;
          fine: number;
          id: Id<"pin_comment_reports">;
          reward: number;
          status: "approved" | "rejected";
        },
        {
          _creationTime: number;
          _id: Id<"pin_comment_reports">;
          admin_comment?: string;
          comment: string;
          commentAuthor: Id<"users"> | string;
          commentId: Id<"pin_comments"> | string;
          createdAt?: string;
          fine: number;
          mongoId?: string;
          pinId: Id<"pins"> | string;
          reporter: Id<"users"> | string;
          reward: number;
          status: "new" | "approved" | "rejected";
          type: Id<"pin_report_type"> | string;
          updatedAt: string;
        }
      >;
    };
    references: {
      listEmptyReferences: FunctionReference<
        "query",
        "public",
        Record<string, never>,
        string
      >;
    };
    ratings: {
      listUsersWithStats: FunctionReference<
        "query",
        "public",
        { limit?: number; page?: number; search?: string },
        {
          hasMore: boolean;
          items: Array<{
            user: any;
            userCompletions: { completed: number; uncompleted: number };
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getUserDetails: FunctionReference<
        "query",
        "public",
        { userId: Id<"users"> },
        {
          fullCompletions: Array<{
            completion: any;
            knowledge: {
              _id: string;
              name?: string;
              stars?: number;
              type: string;
            };
          }>;
          user: any;
        }
      >;
    };
    markup_task_elements: {
      listBySlide: FunctionReference<
        "query",
        "public",
        { markup_task_slide_id: Id<"markup_task_slides"> | string },
        Array<{
          _creationTime: number;
          _id: Id<"markup_task_elements">;
          basis: number;
          description?: string;
          enable_cheating: boolean;
          fine: number;
          geometry: { points: Array<{ x: number; y: number }>; type: string };
          markup_task_slide_id: Id<"markup_task_slides"> | string;
          mongoId?: string;
          name?: string;
          order: number;
          reward: number;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"markup_task_elements"> },
        {
          _creationTime: number;
          _id: Id<"markup_task_elements">;
          basis: number;
          description?: string;
          enable_cheating: boolean;
          fine: number;
          geometry: { points: Array<{ x: number; y: number }>; type: string };
          markup_task_slide_id: Id<"markup_task_slides"> | string;
          mongoId?: string;
          name?: string;
          order: number;
          reward: number;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          basis: number;
          description?: string;
          enable_cheating: boolean;
          fine: number;
          geometry: { points: Array<{ x: number; y: number }>; type: string };
          markup_task_slide_id: Id<"markup_task_slides"> | string;
          mongoId?: string;
          name?: string;
          order: number;
          reward: number;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_elements">;
          basis: number;
          description?: string;
          enable_cheating: boolean;
          fine: number;
          geometry: { points: Array<{ x: number; y: number }>; type: string };
          markup_task_slide_id: Id<"markup_task_slides"> | string;
          mongoId?: string;
          name?: string;
          order: number;
          reward: number;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            basis?: number;
            description?: string;
            enable_cheating?: boolean;
            fine?: number;
            geometry?: {
              points: Array<{ x: number; y: number }>;
              type: string;
            };
            markup_task_slide_id?: Id<"markup_task_slides"> | string;
            mongoId?: string;
            name?: string;
            order?: number;
            reward?: number;
          };
          id: Id<"markup_task_elements">;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_elements">;
          basis: number;
          description?: string;
          enable_cheating: boolean;
          fine: number;
          geometry: { points: Array<{ x: number; y: number }>; type: string };
          markup_task_slide_id: Id<"markup_task_slides"> | string;
          mongoId?: string;
          name?: string;
          order: number;
          reward: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"markup_task_elements"> },
        boolean
      >;
    };
    markup_task_slides: {
      listByStage: FunctionReference<
        "query",
        "public",
        { markup_task_stage_id: Id<"markup_task_stages"> | string },
        Array<{
          _creationTime: number;
          _id: Id<"markup_task_slides">;
          base_height: number;
          description?: string;
          image: string;
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          mongoId?: string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"markup_task_slides"> },
        {
          _creationTime: number;
          _id: Id<"markup_task_slides">;
          base_height: number;
          description?: string;
          image: string;
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          mongoId?: string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          base_height: number;
          description?: string;
          image: string;
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          mongoId?: string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_slides">;
          base_height: number;
          description?: string;
          image: string;
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          mongoId?: string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            base_height?: number;
            description?: string;
            image?: string;
            markup_task_stage_id?: Id<"markup_task_stages"> | string;
            mongoId?: string;
            name?: string;
            order?: number;
            original_height?: number;
            original_width?: number;
          };
          id: Id<"markup_task_slides">;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_slides">;
          base_height: number;
          description?: string;
          image: string;
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          mongoId?: string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"markup_task_slides"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          base_height?: number;
          description?: string;
          image: string | { base64: string; contentType: string };
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_slides">;
          base_height: number;
          description?: string;
          image: string;
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          mongoId?: string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          base_height?: number;
          description?: string;
          id: Id<"markup_task_slides">;
          image?: string | { base64: string; contentType: string };
          markup_task_stage_id?: Id<"markup_task_stages"> | string;
          name?: string;
          order?: number;
          original_height?: number;
          original_width?: number;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_slides">;
          base_height: number;
          description?: string;
          image: string;
          markup_task_stage_id: Id<"markup_task_stages"> | string;
          mongoId?: string;
          name: string;
          order: number;
          original_height?: number;
          original_width?: number;
        }
      >;
    };
    markup_task_stages: {
      listByTask: FunctionReference<
        "query",
        "public",
        { markup_task_id: Id<"markup_tasks"> | string },
        Array<{
          _creationTime: number;
          _id: Id<"markup_task_stages">;
          additional_info?: string;
          base_color?: string;
          description: string;
          element_name?: string;
          info?: string;
          markup_task_id: Id<"markup_tasks"> | string;
          mongoId?: string;
          name: string;
          order: number;
          task_condition?: string;
        }>
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"markup_task_stages"> },
        {
          _creationTime: number;
          _id: Id<"markup_task_stages">;
          additional_info?: string;
          base_color?: string;
          description: string;
          element_name?: string;
          info?: string;
          markup_task_id: Id<"markup_tasks"> | string;
          mongoId?: string;
          name: string;
          order: number;
          task_condition?: string;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          additional_info?: string;
          base_color?: string;
          description: string;
          element_name?: string;
          info?: string;
          markup_task_id: Id<"markup_tasks"> | string;
          mongoId?: string;
          name: string;
          order: number;
          task_condition?: string;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_stages">;
          additional_info?: string;
          base_color?: string;
          description: string;
          element_name?: string;
          info?: string;
          markup_task_id: Id<"markup_tasks"> | string;
          mongoId?: string;
          name: string;
          order: number;
          task_condition?: string;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            additional_info?: string;
            base_color?: string;
            description?: string;
            element_name?: string;
            info?: string;
            markup_task_id?: Id<"markup_tasks"> | string;
            mongoId?: string;
            name?: string;
            order?: number;
            task_condition?: string;
          };
          id: Id<"markup_task_stages">;
        },
        {
          _creationTime: number;
          _id: Id<"markup_task_stages">;
          additional_info?: string;
          base_color?: string;
          description: string;
          element_name?: string;
          info?: string;
          markup_task_id: Id<"markup_tasks"> | string;
          mongoId?: string;
          name: string;
          order: number;
          task_condition?: string;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"markup_task_stages"> },
        boolean
      >;
    };
    markup_tasks: {
      list: FunctionReference<
        "query",
        "public",
        {
          admin_id?: string;
          app_visible?: boolean;
          forcePublish?: boolean;
          limit?: number;
          page?: number;
          search?: string;
        },
        {
          hasMore: boolean;
          items: Array<{
            _creationTime: number;
            _id: Id<"markup_tasks">;
            additional_tasks: Array<{
              description: string;
              name: string;
              task_id: string;
              task_type: string;
            }>;
            app_visible?: boolean;
            cover_image: string;
            description: string;
            idx?: number;
            mongoId?: string;
            name: string;
            publishAfter?: number;
          }>;
          page: number;
          total: number;
          totalPages: number;
        }
      >;
      getById: FunctionReference<
        "query",
        "public",
        { id: Id<"markup_tasks"> },
        {
          _creationTime: number;
          _id: Id<"markup_tasks">;
          additional_tasks: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
          publishAfter?: number;
        } | null
      >;
      getFullById: FunctionReference<
        "query",
        "public",
        { id: Id<"markup_tasks"> },
        any
      >;
      insert: FunctionReference<
        "mutation",
        "public",
        {
          additional_tasks: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
          publishAfter?: number;
        },
        {
          _creationTime: number;
          _id: Id<"markup_tasks">;
          additional_tasks: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
          publishAfter?: number;
        }
      >;
      update: FunctionReference<
        "mutation",
        "public",
        {
          data: {
            additional_tasks?: Array<{
              description: string;
              name: string;
              task_id: string;
              task_type: string;
            }>;
            app_visible?: boolean;
            cover_image?: string;
            description?: string;
            idx?: number;
            mongoId?: string;
            name?: string;
            publishAfter?: number;
          };
          id: Id<"markup_tasks">;
        },
        {
          _creationTime: number;
          _id: Id<"markup_tasks">;
          additional_tasks: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
          publishAfter?: number;
        }
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { id: Id<"markup_tasks"> },
        boolean
      >;
      create: FunctionReference<
        "action",
        "public",
        {
          additional_tasks: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover: string | { base64: string; contentType: string };
          description: string;
          idx?: number;
          name: string;
          publishAfter?: number;
        },
        {
          _creationTime: number;
          _id: Id<"markup_tasks">;
          additional_tasks: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
          publishAfter?: number;
        }
      >;
      updateAction: FunctionReference<
        "action",
        "public",
        {
          additional_tasks?: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover?: string | { base64: string; contentType: string };
          description?: string;
          id: Id<"markup_tasks">;
          idx?: number;
          name?: string;
          publishAfter?: number;
        },
        {
          _creationTime: number;
          _id: Id<"markup_tasks">;
          additional_tasks: Array<{
            description: string;
            name: string;
            task_id: string;
            task_type: string;
          }>;
          app_visible?: boolean;
          cover_image: string;
          description: string;
          idx?: number;
          mongoId?: string;
          name: string;
          publishAfter?: number;
        }
      >;
    };
  };
};
export type InternalApiType = {};
