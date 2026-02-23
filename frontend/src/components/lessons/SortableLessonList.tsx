"use client";

/**
 * EPIC-10: Sortable Lesson List Component (EP10-FE-02)
 * 
 * Drag & drop reorderable lesson list using @dnd-kit
 */

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LessonResponse, LessonType } from "@/lib/api";
import { LessonCard } from "./LessonCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api";

interface SortableLessonListProps {
  lessons: LessonResponse[];
  courseId: string;
  onEdit?: (lesson: LessonResponse) => void;
  onDelete?: (lessonId: string) => void;
}

function SortableLessonItem({
  lesson,
  courseId,
  index,
  onEdit,
  onDelete,
}: {
  lesson: LessonResponse;
  courseId: string;
  index: number;
  onEdit?: (lesson: LessonResponse) => void;
  onDelete?: (lessonId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: lesson.id,
    disabled: false, // Enable dragging
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <LessonCard
        lesson={lesson}
        courseId={courseId}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}

export function SortableLessonList({
  lessons,
  courseId,
  onEdit,
  onDelete,
}: SortableLessonListProps) {
  const queryClient = useQueryClient();
  const [localLessons, setLocalLessons] = useState(lessons);
  const [isReordering, setIsReordering] = useState(false);

  // Update local lessons when props change
  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  // Configure sensors with activation constraints for better UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: (lessonIds: string[]) =>
      coursesApi.reorderLessons(courseId, { lesson_ids: lessonIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setIsReordering(false);
    },
    onError: () => {
      // Rollback on error
      setLocalLessons(lessons);
      setIsReordering(false);
      alert("Ders sıralaması güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localLessons.findIndex((l) => l.id === active.id);
      const newIndex = localLessons.findIndex((l) => l.id === over.id);

      const newLessons = arrayMove(localLessons, oldIndex, newIndex);
      setLocalLessons(newLessons);
      setIsReordering(true);

      // Optimistic update: update order numbers
      const reorderedLessons = newLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      // Call API
      reorderMutation.mutate(reorderedLessons.map((l) => l.id));
    }
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-600 font-medium mb-2">Henüz ders eklenmemiş</p>
        <p className="text-sm text-gray-500 mb-6">Yukarıdaki "Ders Ekle" butonuna tıklayarak ilk dersinizi ekleyin</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localLessons.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {localLessons.map((lesson, index) => (
            <SortableLessonItem
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
      {isReordering && (
        <div className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Sıralama güncelleniyor...</span>
        </div>
      )}
    </DndContext>
  );
}
