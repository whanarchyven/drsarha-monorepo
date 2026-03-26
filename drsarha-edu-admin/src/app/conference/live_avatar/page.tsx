'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';

const ASK_ENDPOINT = '/api/conference/live_avatar/ask';
const TTS_ENDPOINT = '/api/conference/live_avatar/tts';

export default function LiveAvatarPage() {
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [questionError, setQuestionError] = React.useState('');
  const [isAsking, setIsAsking] = React.useState(false);
  const [isCopying, setIsCopying] = React.useState(false);

  const [ttsText, setTtsText] = React.useState('');
  const [ttsError, setTtsError] = React.useState('');
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState('');
  const [audioFileName, setAudioFileName] = React.useState('sarah-tts.mp3');

  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleAsk = async () => {
    if (!question.trim()) {
      setQuestionError('Введите вопрос.');
      return;
    }

    setIsAsking(true);
    setQuestionError('');

    try {
      const response = await fetch(ASK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || 'Не удалось получить ответ.');
      }

      const nextAnswer = payload?.answer?.trim?.() || '';
      setAnswer(nextAnswer);

      if (!ttsText.trim()) {
        setTtsText(nextAnswer);
      }
    } catch (error) {
      setQuestionError(
        error instanceof Error ? error.message : 'Не удалось получить ответ.'
      );
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyAnswer = async () => {
    if (!answer) {
      return;
    }

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(answer);
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  const handleUseAnswerForTts = () => {
    if (answer) {
      setTtsText(answer);
    }
  };

  const handleGenerateAudio = async () => {
    if (!ttsText.trim()) {
      setTtsError('Введите текст для озвучки.');
      return;
    }

    setIsGeneratingAudio(true);
    setTtsError('');

    try {
      const response = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ttsText.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Не удалось сгенерировать аудио.');
      }

      const blob = await response.blob();
      const nextAudioUrl = URL.createObjectURL(blob);
      const nextFileName =
        response.headers.get('X-Generated-File-Name') || 'sarah-tts.mp3';

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(nextAudioUrl);
      setAudioFileName(nextFileName);
    } catch (error) {
      setTtsError(
        error instanceof Error
          ? error.message
          : 'Не удалось сгенерировать аудио.'
      );
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Live Avatar</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Шаг 1: получить ответ от Sarah. Шаг 2: отредактировать текст и
          озвучить его через ElevenLabs.
        </p>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-lg font-medium">1. Вопрос к Sarah</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Этот шаг можно пропустить и сразу перейти к редактированию текста
            ниже.
          </p>
        </div>

        <label className="mb-2 block text-sm font-medium">Вопрос</label>
        <textarea
          className="min-h-36 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
          placeholder="Введите вопрос"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />

        <div className="mt-3 flex flex-wrap gap-3">
          <Button onClick={handleAsk} disabled={isAsking}>
            {isAsking ? 'Отправляем...' : 'Отправить вопрос'}
          </Button>
        </div>

        {questionError && (
          <p className="mt-3 text-sm text-red-600">{questionError}</p>
        )}

        {answer && (
          <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Ответ</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAnswer}
                  disabled={isCopying}
                >
                  {isCopying ? 'Скопировано' : 'Скопировать'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleUseAnswerForTts}>
                  Использовать в TTS
                </Button>
              </div>
            </div>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">
              {answer}
            </pre>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-lg font-medium">2. Редактирование и TTS</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Вставьте любой текст или используйте ответ из шага 1.
          </p>
        </div>

        <label className="mb-2 block text-sm font-medium">Текст для озвучки</label>
        <textarea
          className="min-h-44 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
          placeholder="Введите или вставьте текст"
          value={ttsText}
          onChange={(event) => setTtsText(event.target.value)}
        />

        <div className="mt-3 flex flex-wrap gap-3">
          <Button onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
            {isGeneratingAudio ? 'Генерируем...' : 'Сгенерировать аудио'}
          </Button>

          {answer && (
            <Button variant="outline" onClick={handleUseAnswerForTts}>
              Подставить ответ
            </Button>
          )}
        </div>

        {ttsError && <p className="mt-3 text-sm text-red-600">{ttsError}</p>}

        {audioUrl && (
          <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="text-sm font-medium">Сгенерированное аудио</h3>
            <audio className="mt-3 w-full" controls src={audioUrl}>
              Ваш браузер не поддерживает проигрывание аудио.
            </audio>

            <div className="mt-3">
              <a href={audioUrl} download={audioFileName}>
                <Button variant="outline" size="sm">
                  Скачать аудио
                </Button>
              </a>
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-center pt-32 pb-12">
        <img
          src="/images/sarah_temp.jpg"
          alt="Sarah"
          className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white object-contain shadow-sm"
        />
      </div>
    </div>
  );
}
