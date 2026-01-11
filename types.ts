
export enum DayOfWeek {
  SUNDAY = 0,
  WEDNESDAY = 3
}

export enum Period {
  MORNING = 'Manhã',
  EVENING = 'Noite'
}

export interface Assignment {
  date: string; // ISO string YYYY-MM-DD
  period: Period;
  personName: string;
}

export interface DaySchedule {
  date: Date;
  periods: Period[];
}

export interface MonthData {
  name: string;
  days: DaySchedule[];
}
