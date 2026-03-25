'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  MessageCircle,
  Calendar,
  CheckCircle,
  BookOpen,
  Brain,
  Stethoscope,
  HelpCircle,
  Info,
} from 'lucide-react';
import type { FunctionReturnType } from 'convex/server';
import { api } from '@convex/_generated/api';
import { LoadingSpinner } from './loading-spinner';
import { translateKnowledgeTypeToSlug } from '@/shared/utils/translateKnowledgeType';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';

interface UserDetailsModalProps {
  userDetails: FunctionReturnType<
    typeof api.functions.ratings.getUserDetails
  > | null;
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
}

export function UserDetailsModal({
  userDetails,
  isOpen,
  onClose,
  loading,
}: UserDetailsModalProps) {
  if (!userDetails && !loading) return null;
  if (userDetails && !userDetails.user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Пользователь не найден</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lection':
        return <BookOpen className="w-4 h-4" />;
      case 'clinic_task':
        return <Stethoscope className="w-4 h-4" />;
      case 'interactive_task':
        return <Brain className="w-4 h-4" />;
      case 'interactive_quiz':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'lection':
        return 'Лекция';
      case 'clinic_task':
        return 'Клиническая задача';
      case 'interactive_task':
        return 'Интерактивное задание';
      case 'interactive_quiz':
        return 'Интерактивный тест';
      case 'interactive_match':
        return 'Интерактивное сопоставление';

      default:
        return 'Задание';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  type CompletionItem = NonNullable<
    FunctionReturnType<typeof api.functions.ratings.getUserDetails>
  >['fullCompletions'][number];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Детальная информация о пользователе</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* Основная информация о пользователе */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={userDetails.user.avatar || undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                      {getInitials(
                        userDetails.user.name ||
                          userDetails.user.fullName ||
                          'NN'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {userDetails.user.name ||
                        userDetails.user.fullName ||
                        'Без имени'}
                    </h2>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-base font-bold text-black">
                          {userDetails.user.stars || 0}
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{userDetails.user.email}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{userDetails.user.phone}</span>
                    </div>
                    {userDetails.user.telegram && (
                      <div className="flex items-center text-sm">
                        <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{userDetails.user.telegram}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {userDetails.user.city && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{userDetails.user.city}</span>
                      </div>
                    )}
                    {userDetails.user.workplace && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{userDetails.user.workplace}</span>
                      </div>
                    )}
                    {userDetails.user.position && (
                      <Badge variant="secondary">
                        {userDetails.user.position}
                      </Badge>
                    )}
                  </div>
                </div>

                {userDetails.user.specialization && (
                  <div className="pt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Специализация:{' '}
                    </span>
                    <span className="text-sm">
                      {userDetails.user.specialization}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Завершенные задания */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>
                    Завершенные задания ({userDetails.fullCompletions.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userDetails.fullCompletions.map(
                    (completion: CompletionItem, index: number) => (
                      <div
                        key={completion.completion._id}
                        className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(completion.completion.type)}
                            <div>
                              {completion.knowledge.name ? (
                                <Link
                                  href={`/knowledge/${translateKnowledgeTypeToSlug(completion.completion.type)}/${completion.knowledge._id}/edit`}>
                                  <h4 className="font-medium">
                                    {completion.knowledge.name}
                                  </h4>
                                </Link>
                              ) : (
                                <h4 className="font-medium text-red-500 underline">{`Нет сведений о задании или оно было удалено`}</h4>
                              )}
                              <Badge variant="outline" className="text-xs mt-1">
                                {getTypeName(completion.completion.type)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {completion.knowledge.stars && (
                              <div className="flex items-center space-x-1">
                                <span className="text-base font-bold text-black">
                                  + {completion.knowledge.stars}
                                </span>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Завершено:{' '}
                              {formatDate(
                                completion.completion.completed_at ||
                                  completion.completion.created_at
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {/* <Button className="flex items-center space-x-1" variant="info" size="sm" onClick={() => setShowMetadata(showMetadata.includes(completion.completion._id) ? showMetadata.filter(id => id !== completion.completion._id) : [...showMetadata, completion.completion._id])}>
                            <Info className="w-4 h-4" />
                            <span>Подробнее</span>
                          </Button> */}
                            <Badge
                              variant={
                                completion.completion.is_completed
                                  ? 'default'
                                  : 'secondary'
                              }>
                              {completion.completion.is_completed
                                ? 'Завершено'
                                : 'В процессе'}
                            </Badge>
                          </div>
                        </div>
                        {/* {showMetadata.includes(completion.completion._id) && (
                        <div className="mt-4">
                          <Card className="bg-gray-100 p-2 max-w-xl">
                            <CardHeader>
                              <CardTitle>Метаданные</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <pre className="text-sm bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                {JSON.stringify(completion.completion.metadata, null, 2)}
                              </pre>
                            </CardContent>
                          </Card>
                        </div>
                      )} */}
                      </div>
                    )
                  )}

                  {userDetails.fullCompletions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Завершенных заданий пока нет</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
