'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { BoardColumn, Task } from '@/types/project'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/common/Button'

interface KanbanBoardProps {
  columns: BoardColumn[]
  onTaskMove: (taskId: string, targetColumnId: string, position: number) => void
  onTaskClick: (task: Task) => void
  onAddTask: (columnId: string) => void
}

export function KanbanBoard({ columns, onTaskMove, onTaskClick, onAddTask }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    onTaskMove(draggableId, destination.droppableId, destination.index)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-1 min-w-[320px] bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {column.name}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({column.tasks.length})
                </span>
              </h3>
              <Button
                onClick={() => onAddTask(column.id)}
                size="sm"
                variant="secondary"
              >
                +
              </Button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] space-y-2 ${
                    snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'opacity-50' : ''}
                        >
                          <TaskCard task={task} onClick={() => onTaskClick(task)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
