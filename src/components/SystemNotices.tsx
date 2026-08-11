import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { SystemNotice } from '../types';

interface SystemNoticesProps {
  notices: SystemNotice[];
}

export const SystemNotices: React.FC<SystemNoticesProps> = ({ notices }) => {
  const getNoticeStyle = (type: SystemNotice['type']) => {
    switch (type) {
      case 'priority':
        return {
          icon: ShieldAlert,
          color: '#e11d48',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          textColor: 'text-rose-700',
        };
      case 'watch':
        return {
          icon: AlertTriangle,
          color: '#d97706',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          textColor: 'text-amber-700',
        };
      case 'stable':
        return {
          icon: CheckCircle,
          color: '#059669',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          textColor: 'text-emerald-700',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-8">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          SYSTEM NOTICES — WHERE TO FOCUS
        </span>
        <span className="font-data-mono text-[10px] font-semibold text-slate-400">
          Computed live from telemetry & voice sentiment
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notices.map((notice) => {
          const style = getNoticeStyle(notice.type);
          const Icon = style.icon;

          return (
            <div
              key={notice.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5 hover:border-slate-300 transition-all"
            >
              <div className={`p-2 rounded-lg ${style.bg} ${style.border} border shrink-0 mt-0.5`}>
                <Icon className="w-5 h-5" style={{ color: style.color }} />
              </div>

              <div>
                <div
                  className={`text-xs font-bold uppercase mb-1 tracking-wider ${style.textColor}`}
                >
                  {notice.title}
                </div>
                <div className="font-sans text-xs text-slate-700 leading-relaxed">
                  {notice.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
