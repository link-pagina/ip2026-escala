
import { DayOfWeek, Period, DaySchedule, MonthData } from './types';

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const generateYearSchedule = (year: number): MonthData[] => {
  const schedule: MonthData[] = MONTH_NAMES.map((name) => ({
    name,
    days: []
  }));

  const date = new Date(year, 0, 1);
  while (date.getFullYear() === year) {
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === DayOfWeek.SUNDAY || dayOfWeek === DayOfWeek.WEDNESDAY) {
      const monthIndex = date.getMonth();
      const periods: Period[] = [];
      
      if (dayOfWeek === DayOfWeek.SUNDAY) {
        periods.push(Period.MORNING, Period.EVENING);
      } else {
        periods.push(Period.EVENING);
      }

      schedule[monthIndex].days.push({
        date: new Date(date),
        periods
      });
    }
    
    date.setDate(date.getDate() + 1);
  }

  return schedule;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    weekday: 'long'
  }).replace(/^\w/, (c) => c.toUpperCase());
};

export const getDayKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
