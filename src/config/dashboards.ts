import { GraduationCap, Megaphone } from 'lucide-react'

export const DASHBOARDS = {
  onboarding: {
    csvUrl:
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRrg3qnsE3vAMI7NwqVXW31CnvleQjR6RjHPjXEUAZAZVgiorKtf3mFvwqTyBMDEJ2xQO9hUXdcAA9q/pub?output=csv',
    title: 'live de leads',
    fullTitle: 'Dashboard da live de leads',
    path: '/',
    icon: GraduationCap,
  },
  leads: {
    csvUrl:
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRIfDNJI2X3oM5GP3BrPqJn58boIEDtYizqTOTJJ186gVJe6tYYcqt9BFt_vgIW-qEj0GM4XGcJKzH/pub?output=csv',
    title: 'Leads',
    fullTitle: 'Dashboard de Leads',
    path: '/leads',
    icon: Megaphone,
  },
} as const
