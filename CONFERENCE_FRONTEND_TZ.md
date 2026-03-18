# ТЗ на фронтенд интеграцию conference-системы

## 1. Цель
Реализовать отдельный frontend для страницы конференции, состоящей из трех подсистем:

1. Трансляция конференции
2. Чат участников трансляции
3. Интерактивная часть: тест / опрос

Фронтенд должен подключаться напрямую к `Convex`, без промежуточного HTTP API.

## 2. Общие вводные

### 2.1. Что уже есть
На backend уже заведены сущности и базовые функции для:
- конфигурации трансляции;
- чата;
- интерактивов;
- пользователей конференции.

### 2.2. Что важно
- Регистрация на этом фронтенде не нужна.
- Оплата на этом фронтенде не нужна.
- На этом фронтенде нужен только вход пользователя конференции.
- Пользователь не может проходить интерактив повторно.
- Для вопросов нужен явный `selectionMode`.
- Чат должен поддерживать модерацию.
- Результаты интерактива должны показываться только по команде администратора.

### 2.3. Как обращаться к Convex
Фронтенд должен вызывать публичные `Convex`-функции через generated `api` из:
- `drsarha-backend/convex/_generated/api`

Формат вызова:
- query: `api.functions.<fileName>.<functionName>`
- mutation: `api.functions.<fileName>.<functionName>`

Конкретно для conference-модуля используются:
- `api.functions.conference_users.loginConferenceUser`
- `api.functions.conference_users.getConferenceUsers`
- `api.functions.conference_users.patchConferenceUserByEmail`
- `api.functions.conference_broadcast.getBroadcastConfig`
- `api.functions.conference_broadcast.upsertBroadcastConfig`
- `api.functions.conference_broadcast.setBroadcastVisibility`
- `api.functions.conference_chat.listMessages`
- `api.functions.conference_chat.createMessage`
- `api.functions.conference_chat.createAiMessage`
- `api.functions.conference_chat.updateMessage`
- `api.functions.conference_chat.deleteMessage`
- `api.functions.conference_chat.toggleReaction`
- `api.functions.conference_chat.getMyReactions`
- `api.functions.conference_interactives.listInteractives`
- `api.functions.conference_interactives.getInteractiveById`
- `api.functions.conference_interactives.getDisplayedInteractive`
- `api.functions.conference_interactives.createInteractive`
- `api.functions.conference_interactives.updateInteractive`
- `api.functions.conference_interactives.deleteInteractive`
- `api.functions.conference_interactives.setDisplayedInteractive`
- `api.functions.conference_interactives.submitResponse`
- `api.functions.conference_interactives.getInteractiveProgress`
- `api.functions.conference_interactives.getInteractiveStats`
- `api.functions.conference_interactives.getQuizLeaderboard`

## 3. Архитектура страницы

### 3.1. Состав страницы
Страница должна содержать:
- блок трансляции;
- блок чата;
- блок интерактива.

### 3.2. Рекомендуемый layout
Desktop:
- основная колонка: трансляция + интерактив;
- боковая колонка: чат.

Mobile:
- вертикальный стек:
  - трансляция;
  - интерактив;
  - чат.

## 4. Авторизация пользователя

### 4.1. Цель
Пользователь должен войти как `conference_user`, чтобы получить доступ к странице.

### 4.2. Что требуется от фронтенда
Нужен экран входа:
- поле логина;
- поле пароля;
- кнопка входа;
- ошибки авторизации;
- состояние загрузки.

Используемая `Convex`-функция:
- `api.functions.conference_users.loginConferenceUser`

### 4.3. Состояние пользователя на клиенте
Фронт должен хранить:
- `conferenceUserId`;
- `name`;
- `email`;
- `side`;
- флаг авторизации.

Рекомендуемое хранение:
- runtime store;
- `localStorage` для восстановления сессии.

### 4.4. Ограничение доступа
Если пользователь не авторизован:
- показывается только экран входа.

Если авторизован:
- показывается основная страница конференции.

## 5. Подсистема 1: Трансляция

### 5.1. Назначение
Показывать iframe трансляции текущей конференции.

### 5.2. Backend-контракт
Используется singleton-конфиг:

```ts
type ConferenceBroadcast = {
  _id: string
  iframeUrl: string
  isDisplayed: boolean
  title?: string
  createdAt: number
  updatedAt: number
}
```

### 5.3. Используемая функция
- `api.functions.conference_broadcast.getBroadcastConfig`

Для админского управления:
- `api.functions.conference_broadcast.upsertBroadcastConfig`
- `api.functions.conference_broadcast.setBroadcastVisibility`

### 5.4. Логика отображения
Если:
- конфиг отсутствует;
- `isDisplayed === false`;
- `iframeUrl` пустой;

показывать заглушку:
- `Трансляция скоро начнется`.

Если `isDisplayed === true`:
- рендерить iframe.

### 5.5. UI-требования
- iframe адаптивный;
- ratio `16:9`;
- skeleton при загрузке;
- fallback при ошибке загрузки iframe.

## 6. Подсистема 2: Чат

### 6.1. Назначение
Реализовать live-чат участников трансляции.

### 6.2. Поддерживаемые авторы
- `conference_user`
- `ai`

Поддерживаемые `side`:
- `jedi`
- `sith`
- `ai`

### 6.3. Модель сообщения

```ts
type ConferenceChatMessage = {
  _id: string
  authorType: "conference_user" | "ai"
  conferenceUserId: string | null
  authorName: string
  authorSide: "jedi" | "sith" | "ai"
  messageText: string
  replyToMessageId: string | null
  likesCount: number
  dislikesCount: number
  repliesCount: number
  isDeleted: boolean
  createdAt: number
  updatedAt?: number
}
```

### 6.4. Основные backend-функции
- `api.functions.conference_chat.listMessages({ parentMessageId?, limit?, cursor? })`
- `api.functions.conference_chat.createMessage({ conferenceUserId, messageText, replyToMessageId? })`
- `api.functions.conference_chat.createAiMessage({ messageText, replyToMessageId?, authorName? })`
- `api.functions.conference_chat.updateMessage({ id, conferenceUserId, messageText })`
- `api.functions.conference_chat.deleteMessage({ id, conferenceUserId? })`
- `api.functions.conference_chat.toggleReaction({ messageId, conferenceUserId, reaction })`
- `api.functions.conference_chat.getMyReactions({ conferenceUserId, messageIds })`

### 6.5. Основной UX
Чат должен поддерживать:
- загрузку root-сообщений;
- отправку нового сообщения;
- ответы на сообщения;
- like;
- dislike;
- отображение количества ответов;
- раскрытие треда;
- автообновление данных через `Convex`.

### 6.6. Поведение reply
Ответы реализуются через `replyToMessageId`.

На фронте:
- основной поток показывает root-сообщения;
- ответы раскрываются под родительским сообщением;
- нужен UI:
  - `Ответить`;
  - `Показать ответы (N)`.

### 6.7. Поведение реакций
Для каждого сообщения:
- `like`;
- `dislike`.

Логика:
- повторное нажатие снимает текущую реакцию;
- переключение `like -> dislike` и обратно меняет состояние;
- текущая реакция пользователя должна быть визуально подсвечена.

### 6.8. Удаленные сообщения
Если `isDeleted === true`:
- текст сообщения не показывается;
- вместо него выводится `Сообщение удалено`.

### 6.9. Состояния чата
Нужны состояния:
- `loading`;
- `empty`;
- `sending`;
- `error`;
- `optimistic update` для сообщений и реакций.

## 7. Модерация чата

### 7.1. Требование
Чат должен поддерживать модерацию.

### 7.2. Минимальный UI модерации
Для роли модератора / администратора должны быть доступны действия:
- удалить сообщение;
- скрыть сообщение;
- ответить от имени `ai`;
- ограничить пользователя в чате.

### 7.3. Что должен уметь интерфейс
- показывать меню действий у сообщения;
- подтверждать destructive actions;
- различать обычного пользователя и модератора.

### 7.4. Важно
Если backend-модерация не доведена до конца, фронт должен проектироваться с учетом будущих модераторских действий, но реальная доступность кнопок зависит от финального backend-контракта.

## 8. Подсистема 3: Интерактив

### 8.1. Назначение
Во время трансляции пользователь проходит:
- `quiz`;
- `poll`.

### 8.2. Модель интерактива

```ts
type ConferenceInteractive = {
  _id: string
  title: string
  kind: "quiz" | "poll"
  showResults: boolean
  isDisplayed: boolean
  questions: Question[]
  createdAt: number
  updatedAt: number
}
```

```ts
type Question = {
  id: string
  image?: string
  questionText: string
  selectionMode?: "single" | "multiple"
  variants: Variant[]
}
```

```ts
type Variant = {
  id: string
  text: string
  isCorrect?: boolean
}
```

### 8.3. Модель ответа

```ts
type ConferenceInteractiveResponse = {
  _id: string
  interactiveId: string
  questionId: string
  conferenceUserId: string
  selectedVariantIds: string[]
  isCorrect?: boolean
  answeredAt: number
  updatedAt?: number
}
```

### 8.4. Основные backend-функции
- `api.functions.conference_interactives.listInteractives`
- `api.functions.conference_interactives.getInteractiveById`
- `api.functions.conference_interactives.getDisplayedInteractive`
- `api.functions.conference_interactives.createInteractive`
- `api.functions.conference_interactives.updateInteractive`
- `api.functions.conference_interactives.deleteInteractive`
- `api.functions.conference_interactives.setDisplayedInteractive({ id, isDisplayed })`
- `api.functions.conference_interactives.submitResponse({ interactiveId, questionId, conferenceUserId, selectedVariantIds })`
- `api.functions.conference_interactives.getInteractiveProgress({ interactiveId, conferenceUserId })`
- `api.functions.conference_interactives.getInteractiveStats({ interactiveId })`
- `api.functions.conference_interactives.getQuizLeaderboard({ interactiveId })`

## 9. SelectionMode

### 9.1. Обязательное правило
Фронтенд должен опираться на `selectionMode`, а не пытаться определять режим выбора самостоятельно.

### 9.2. Поддерживаемые значения
- `single`
- `multiple`

### 9.3. UI
Для:
- `single` использовать radio-like поведение;
- `multiple` использовать checkbox-like поведение.

### 9.4. Ограничение
Если вопрос `single`, фронт не должен позволять выбрать больше одного варианта.

## 10. Логика прохождения интерактива

### 10.1. Базовый сценарий
1. Пользователь видит активный интерактив.
2. Видит текущий вопрос.
3. Выбирает один или несколько вариантов.
4. Нажимает `Ответить`.
5. Ответ сохраняется.
6. После завершения времени вопроса показывается следующий вопрос.

### 10.2. Повторное прохождение
Пользователь не может:
- перепройти интерактив заново;
- сбросить свой прогресс;
- проходить уже завершенный интерактив повторно.

### 10.3. Пропуск вопроса
Если пользователь не ответил до окончания времени:
- вопрос считается пропущенным;
- фронт переводит пользователя дальше.

## 11. Временная логика вопроса

### 11.1. Бизнес-правило
У каждого вопроса должно быть время на ответ.

После завершения времени:
- вопрос блокируется;
- показывается следующий вопрос.

### 11.2. Что нужно фронту
Фронт должен иметь доступ к runtime-состоянию:
- какой вопрос активен сейчас;
- когда начался вопрос;
- когда истекает его время;
- завершен ли вопрос;
- опубликованы ли результаты.

### 11.3. Важный момент
Frontend не должен сам быть источником истины для таймера. Источник истины должен приходить из backend/admin runtime-state.

## 12. Экран вопроса

### 12.1. Что должно быть на экране
- изображение вопроса, если оно есть;
- прогресс вида `Вопрос X / N`;
- текст вопроса;
- варианты ответа;
- таймер обратного отсчета;
- кнопка `Ответить`.

### 12.2. Поведение кнопки
Кнопка `Ответить`:
- disabled, если ничего не выбрано;
- disabled во время отправки;
- disabled после истечения времени вопроса.

## 13. Результаты интерактива

### 13.1. Главное правило
Результаты показываются только по команде администратора.

### 13.2. Если пользователь уже закончил, но результаты закрыты
Показывать экран ожидания:
- `Ожидайте публикации результатов`.

### 13.3. Если результаты опубликованы
Фронт должен автоматически переключаться на экран результатов.

## 14. Результаты для poll

### 14.1. Что отображать
Для каждого вопроса:
- текст вопроса;
- варианты;
- количество голосов;
- проценты;
- визуализацию в виде bar chart / progress bars.

### 14.2. Формат
Подходит отображение по макету:
- график сверху;
- ниже список вариантов и число голосов.

## 15. Результаты для quiz

### 15.1. Блоки
Нужно показывать два блока:
- `Лучшие результаты`;
- `Правильные ответы`.

### 15.2. Лучшие результаты
Источник:
- `api.functions.conference_interactives.getQuizLeaderboard({ interactiveId })`

Показывать:
- имя пользователя;
- side;
- score.

### 15.3. Правильные ответы
Нужно показать:
- текст вопроса;
- правильный вариант или варианты.

Если правильных ответов несколько:
- перечислять все.

## 16. Компонентная структура

### 16.1. Страница
- `ConferencePage`

### 16.2. Авторизация
- `ConferenceLoginForm`

### 16.3. Трансляция
- `ConferenceBroadcast`
- `BroadcastPlaceholder`

### 16.4. Чат
- `ConferenceChat`
- `ChatMessageList`
- `ChatMessageItem`
- `ChatReplyThread`
- `ChatComposer`
- `ReactionButtons`
- `ChatModerationMenu`

### 16.5. Интерактив
- `ConferenceInteractive`
- `InteractiveQuestionCard`
- `InteractiveTimer`
- `InteractiveVariants`
- `InteractiveWaitingScreen`
- `PollResults`
- `QuizResults`
- `QuizLeaderboard`
- `CorrectAnswersList`

## 17. Клиентское состояние

### 17.1. Server state
Нужно хранить и синхронизировать:
- текущего conference user;
- broadcast config;
- список сообщений;
- ответы на сообщения;
- мои реакции;
- активный интерактив;
- прогресс пользователя;
- результаты;
- leaderboard.

### 17.2. UI state
Нужно локально хранить:
- выбранные ответы;
- текущий индекс вопроса;
- открыт ли тред;
- состояние composer;
- состояние модераторского меню.

## 18. Нефункциональные требования

### 18.1. Производительность
- чат должен поддерживать пагинацию;
- replies желательно подгружать отдельно;
- результаты не должны блокировать рендер страницы.

### 18.2. Адаптивность
Обязательно:
- mobile;
- tablet;
- desktop.

### 18.3. Доступность
- keyboard navigation;
- visible focus states;
- aria-label для интерактивных кнопок.

## 19. Must have для первого релиза
- экран входа;
- отображение трансляции;
- чат с reply;
- чат с like/dislike;
- чат с сообщениями от `ai`;
- базовая модерация чата;
- отображение активного интерактива;
- поддержка `selectionMode`;
- поддержка single и multiple выбора;
- таймер вопроса;
- автоматический переход к следующему вопросу;
- запрет повторного прохождения;
- экран ожидания результатов;
- показ результатов по команде администратора;
- leaderboard для `quiz`;
- статистика для `poll`;
- адаптивный layout.

## 20. Важное замечание по backend readiness
Frontend может идти напрямую в `Convex`, это корректный целевой вариант.

При этом для полного соответствия UX нужно учитывать, что backend должен поддерживать не только базовые CRUD-сущности, но и runtime-логику конференции:
- вход пользователя конференции;
- live-состояние интерактива;
- таймеры вопросов;
- публикацию результатов;
- полную модерацию чата.

Если часть этих функций еще не завершена, frontend должен проектироваться так, чтобы их можно было подключить без переработки архитектуры.

## 21. Сводка конечных Convex путей

### 21.1. Авторизация и пользователь конференции
- `api.functions.conference_users.loginConferenceUser`
- `api.functions.conference_users.getConferenceUsers`
- `api.functions.conference_users.patchConferenceUserByEmail`

### 21.2. Трансляция
- `api.functions.conference_broadcast.getBroadcastConfig`
- `api.functions.conference_broadcast.upsertBroadcastConfig`
- `api.functions.conference_broadcast.setBroadcastVisibility`

### 21.3. Чат
- `api.functions.conference_chat.listMessages`
- `api.functions.conference_chat.createMessage`
- `api.functions.conference_chat.createAiMessage`
- `api.functions.conference_chat.updateMessage`
- `api.functions.conference_chat.deleteMessage`
- `api.functions.conference_chat.toggleReaction`
- `api.functions.conference_chat.getMyReactions`

### 21.4. Интерактив
- `api.functions.conference_interactives.listInteractives`
- `api.functions.conference_interactives.getInteractiveById`
- `api.functions.conference_interactives.getDisplayedInteractive`
- `api.functions.conference_interactives.createInteractive`
- `api.functions.conference_interactives.updateInteractive`
- `api.functions.conference_interactives.deleteInteractive`
- `api.functions.conference_interactives.setDisplayedInteractive`
- `api.functions.conference_interactives.submitResponse`
- `api.functions.conference_interactives.getInteractiveProgress`
- `api.functions.conference_interactives.getInteractiveStats`
- `api.functions.conference_interactives.getQuizLeaderboard`
