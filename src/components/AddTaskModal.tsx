import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Settings2, BookOpen, Loader2 } from 'lucide-react';
import { ICON_MAP } from '@/constants';
import { createTask, getAvailableSutras, updateTask } from '@/actions/tasks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 添加/编辑功课弹窗组件
 * 用于用户请领新的功课或修改现有功课的配置（如每日目标、是否为每日功课等）
 */
export default function AddTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  taskToEdit
}: {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: any) => void;
  onTaskUpdated?: (task: any) => void;
  taskToEdit?: any;
}) {
  const [configuringTask, setConfiguringTask] = useState<any | null>(null);
  const [selectedSutra, setSelectedSutra] = useState<any | null>(null);
  const [configTarget, setConfigTarget] = useState<number | string>(1);
  const [configStep, setConfigStep] = useState<number>(1);
  const [isDaily, setIsDaily] = useState(false);
  const [dbSutras, setDbSutras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 延迟加载数据，让动画先完成，提升流畅度
      const timer = setTimeout(() => {
        getAvailableSutras().then((data) => {
          setDbSutras(data);
          // 数据加载完成后滚动到顶部
          requestAnimationFrame(() => {
            modalRef.current?.scrollTo({ top: 0, behavior: 'instant' });
          });
        });
      }, 100);

      if (taskToEdit) {
        // 如果是编辑模式，初始化表单状态
        const text = taskToEdit.text.startsWith("读诵《") && taskToEdit.text.endsWith("》")
          ? taskToEdit.text.slice(3, -1)
          : taskToEdit.text;

        setConfiguringTask({
          ...taskToEdit,
          text
        });
        setConfigTarget(taskToEdit.target || 1);
        setConfigStep(taskToEdit.step || 1);
        // 鲁棒地检查每日状态
        const dailyStatus = !!(taskToEdit.isDaily === true || taskToEdit.isDaily === "true" || taskToEdit.isDaily === 1);
        setIsDaily(dailyStatus);
      } else {
        // 重置为新建模式
        setConfiguringTask(null);
        setSelectedSutra(null);
        setConfigTarget(1);
        setConfigStep(1);
        setIsDaily(false);
      }

      // Android 返回键支持
      window.history.pushState({ modal: 'add-task' }, '');

      const handlePopState = () => {
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state?.modal === 'add-task') {
          window.history.back();
        }
      };
    }
  }, [isOpen, taskToEdit, onClose]);

  if (!isOpen) return null;

  /**
   * 处理选择预设功课
   * 只是选中，不会立即触发创建
   */
  const handleSelectPreset = (item: any) => {
    setSelectedSutra(item);
    setConfigTarget(item.currentTarget || item.defaultTarget || 1);
    setConfigStep(item.defaultStep || 1);

    // 确保布尔值转换的鲁棒性
    const dailyStatus = !!(item.isDaily === true || item.isDaily === "true" || item.isDaily === 1);
    setIsDaily(dailyStatus);

    // 如果该功课已存在，则同步设置 configuringTask 以便触发“切换即保存”逻辑
    if (item.existingTaskId) {
      setConfiguringTask({
        id: item.existingTaskId,
        text: item.type === 'sutra' ? `读诵《${item.text}》` : item.text,
        iconId: item.iconId,
        isDaily: dailyStatus,
        target: item.currentTarget || item.defaultTarget || 1
      });
    }
  };

  /**
   * 确认请领功课
   */
  const handleClaim = async () => {
    if (!selectedSutra || loading) return;
    setLoading(true);
    try {
      const text = selectedSutra.type === 'sutra' ? `读诵《${selectedSutra.text}》` : selectedSutra.text;
      const newTask = await createTask({
        text,
        type: selectedSutra.type,
        iconId: selectedSutra.iconId,
        sutraId: selectedSutra.sutraId,
        target: typeof configTarget === 'string' ? parseInt(configTarget) : configTarget,
        step: configStep,
        isDaily: isDaily,
      });

      if (onTaskCreated) {
        onTaskCreated(newTask);
      }
      onClose();
    } catch (error) {
      console.error("Claim Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新“每日功课”状态
   * 如果是已存在的功课，会立即保存到数据库
   */
  const updateDailyStatus = async (val: boolean) => {
    if (loading) return;

    const targetTask = taskToEdit || configuringTask;
    if (targetTask?.id) {
      setLoading(true);
      // 先更新本地 UI 状态，提供即时反馈
      setIsDaily(val);
      try {
        const result = await updateTask(targetTask.id, { isDaily: val });
        if (result.success) {
          // 同步父组件的状态
          if (onTaskUpdated) onTaskUpdated(result.task);

          // 再次确认状态（以数据库返回为准）
          const finalDaily = !!(result.task.isDaily === true || (result.task.isDaily as unknown as string) === "true" || (result.task.isDaily as unknown as number) === 1);
          setIsDaily(finalDaily);

          // 更新当前配置中的对象，确保后续操作基于最新数据
          setConfiguringTask((prev: any) => ({ ...prev, ...result.task }));
        } else {
          // 失败则回滚
          setIsDaily(!val);
        }
      } catch (error) {
        console.error("Failed to update daily status:", error);
        setIsDaily(!val);
      } finally {
        setLoading(false);
      }
    } else {
      // 尚未创建的任务，仅更改本地状态，在 handleClaim 时一并保存
      setIsDaily(val);
    }
  };

  /**
   * 更新目标值
   * 如果是有效数字，会实时保存到后端
   */
  const updateTargetValue = async (val: string | number) => {
    setConfigTarget(val);

    const numVal = typeof val === 'string' ? parseInt(val) : val;

    // 仅当是 >= 1 的有效数字时才更新后端
    if (!isNaN(numVal) && numVal >= 1) {
      const targetTask = taskToEdit || configuringTask;
      if (targetTask?.id) {
        setLoading(true);
        const result = await updateTask(targetTask.id, { target: numVal });
        if (result.success) {
          if (onTaskUpdated) onTaskUpdated(result.task);
          setConfiguringTask(result.task);
        }
        setLoading(false);
      }
    }
  };

  /**
   * 处理目标值输入框失去焦点
   * 确保值合法，并进行最终保存
   */
  const handleTargetBlur = async () => {
    let finalVal = 1;
    if (typeof configTarget === 'number') {
      finalVal = Math.max(1, configTarget);
    } else {
      const parsed = parseInt(configTarget);
      finalVal = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }

    if (finalVal !== configTarget) {
      setConfigTarget(finalVal);
      const targetTask = taskToEdit || configuringTask;
      if (targetTask?.id) {
        const result = await updateTask(targetTask.id, { target: finalVal });
        if (result.success && onTaskUpdated) {
          onTaskUpdated(result.task);
        }
      }
    }
  };

  const handleConfirm = () => {
    setConfiguringTask(null);
    onClose();
  };

  const displayItems = dbSutras.map(s => ({
    id: s.id,
    text: s.title,
    type: s.type,
    iconId: s.iconId,
    sutraId: s.id,
    step: s.defaultStep || 1,
    isDaily: s.isDaily,
    currentTarget: s.currentTarget,
    existingTaskId: s.existingTaskId,
    defaultTarget: s.defaultTarget
  }));

  return (
    <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4" onClick={onClose}>
      <div ref={modalRef} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        {!configuringTask && !selectedSutra ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif text-stone-800 tracking-wide">请领功课</h3>
              <button onClick={onClose} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="space-y-3 pb-8">
              {displayItems.map((item: any) => (
                <button key={item.id} onClick={() => handleSelectPreset(item)} className="w-full flex items-center p-5 bg-stone-50 rounded-[1.5rem] border border-stone-100 hover:border-emerald-100 transition-all hover:bg-stone-100 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform">
                    {ICON_MAP[item.iconId || ''] || <BookOpen className="text-blue-600" size={18} />}
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-stone-800 block">{item.text}</span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest">{item.type}</span>
                  </div>
                  <Plus size={18} className="text-stone-300" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button onClick={() => { setConfiguringTask(null); setSelectedSutra(null); }} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mr-3">
                  <ArrowLeft size={20} />
                </button>
                <h3 className="text-2xl font-serif text-stone-800 tracking-wide">
                  {taskToEdit ? "修改设定" : selectedSutra ? "请领确认" : "修持设定"}
                </h3>
              </div>
              {taskToEdit && loading && (
                <div className="flex items-center text-[10px] text-emerald-600 animate-pulse font-medium tracking-widest uppercase">
                  同步中...
                </div>
              )}
              {taskToEdit && !loading && (
                <button onClick={onClose} className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400">
                  <Plus size={24} className="rotate-45" />
                </button>
              )}
            </div>
            <div className="space-y-8 mb-10">
              <div className="text-center py-6 bg-stone-50 rounded-[2rem] border border-stone-100 mb-4 px-4">
                <div className="scale-150 flex justify-center mb-2">{ICON_MAP[(configuringTask || selectedSutra).iconId || ''] || <BookOpen className="text-blue-600" size={18} />}</div>
                <p className="text-lg text-stone-800 font-serif">{(configuringTask || selectedSutra).text}</p>
                {selectedSutra?.description && (
                  <p className="text-xs text-stone-400 mt-2 px-4 leading-relaxed line-clamp-2 italic">
                    {selectedSutra.description}
                  </p>
                )}
                {taskToEdit && (
                  <p className="text-[10px] text-stone-300 mt-2 uppercase tracking-[0.2em]">所有改动将实时保存</p>
                )}
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  updateDailyStatus(!isDaily);
                }}
                className="flex items-center justify-between px-6 py-4 bg-stone-50 rounded-3xl border border-stone-100 cursor-pointer hover:bg-stone-100/50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-stone-800">设为每日功课</span>
                  <span className="text-[10px] text-stone-400">每天凌晨自动重置进度</span>
                </div>
                <div
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative flex items-center px-1",
                    isDaily ? "bg-emerald-500" : "bg-stone-300",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading && taskToEdit && (
                    <Loader2 size={10} className="text-white animate-spin absolute left-1/2 -translate-x-1/2 z-10" />
                  )}
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    isDaily ? "ml-auto" : "ml-0"
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-stone-400 tracking-[0.2em] flex items-center">
                  <Settings2 size={12} className="mr-2" /> 每日发愿目标 (遍/日)
                </label>
                <input
                  type="number"
                  value={configTarget}
                  onChange={(e) => updateTargetValue(e.target.value)}
                  onBlur={handleTargetBlur}
                  className="w-full bg-stone-50 border border-stone-200 p-6 rounded-3xl text-center text-3xl font-serif text-emerald-700 focus:ring-2 focus:ring-stone-300 transition-all outline-none"
                />
              </div>
            </div>

            {selectedSutra && (
              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full h-14 bg-stone-800 text-white rounded-[1.5rem] text-base shadow-lg active:scale-95 transition-all hover:bg-stone-900 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <BookOpen size={20} />}
                确认请领功课
              </button>
            )}
            {taskToEdit && (
              <p className="text-center text-xs text-stone-300 italic tracking-wider">设置已实时生效，点击上方返回或关闭即可</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}