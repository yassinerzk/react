import type { Localized } from './types';
import type { GeoPoint } from './prayer';

export interface City extends GeoPoint {
  id: string;
  name: Localized;
  /** IANA time zone so times display correctly when browsing another city. */
  timeZone: string;
}

/** Preset locations for people who prefer not to share their position. */
export const CITIES: readonly City[] = [
  {
    id: 'makkah',
    name: { en: 'Makkah', ar: 'مكة المكرمة' },
    lat: 21.4225,
    lng: 39.8262,
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'madinah',
    name: { en: 'Madinah', ar: 'المدينة المنورة' },
    lat: 24.4672,
    lng: 39.6024,
    timeZone: 'Asia/Riyadh',
  },
  { id: 'riyadh', name: { en: 'Riyadh', ar: 'الرياض' }, lat: 24.7136, lng: 46.6753, timeZone: 'Asia/Riyadh' },
  { id: 'jeddah', name: { en: 'Jeddah', ar: 'جدة' }, lat: 21.4858, lng: 39.1925, timeZone: 'Asia/Riyadh' },
  { id: 'dubai', name: { en: 'Dubai', ar: 'دبي' }, lat: 25.2048, lng: 55.2708, timeZone: 'Asia/Dubai' },
  { id: 'doha', name: { en: 'Doha', ar: 'الدوحة' }, lat: 25.2854, lng: 51.531, timeZone: 'Asia/Qatar' },
  {
    id: 'kuwait',
    name: { en: 'Kuwait City', ar: 'مدينة الكويت' },
    lat: 29.3759,
    lng: 47.9774,
    timeZone: 'Asia/Kuwait',
  },
  { id: 'muscat', name: { en: 'Muscat', ar: 'مسقط' }, lat: 23.588, lng: 58.3829, timeZone: 'Asia/Muscat' },
  { id: 'amman', name: { en: 'Amman', ar: 'عمّان' }, lat: 31.9454, lng: 35.9284, timeZone: 'Asia/Amman' },
  {
    id: 'jerusalem',
    name: { en: 'Jerusalem', ar: 'القدس' },
    lat: 31.7683,
    lng: 35.2137,
    timeZone: 'Asia/Jerusalem',
  },
  { id: 'beirut', name: { en: 'Beirut', ar: 'بيروت' }, lat: 33.8938, lng: 35.5018, timeZone: 'Asia/Beirut' },
  {
    id: 'damascus',
    name: { en: 'Damascus', ar: 'دمشق' },
    lat: 33.5138,
    lng: 36.2765,
    timeZone: 'Asia/Damascus',
  },
  {
    id: 'baghdad',
    name: { en: 'Baghdad', ar: 'بغداد' },
    lat: 33.3152,
    lng: 44.3661,
    timeZone: 'Asia/Baghdad',
  },
  { id: 'cairo', name: { en: 'Cairo', ar: 'القاهرة' }, lat: 30.0444, lng: 31.2357, timeZone: 'Africa/Cairo' },
  {
    id: 'khartoum',
    name: { en: 'Khartoum', ar: 'الخرطوم' },
    lat: 15.5007,
    lng: 32.5599,
    timeZone: 'Africa/Khartoum',
  },
  {
    id: 'tripoli',
    name: { en: 'Tripoli', ar: 'طرابلس' },
    lat: 32.8872,
    lng: 13.1913,
    timeZone: 'Africa/Tripoli',
  },
  { id: 'tunis', name: { en: 'Tunis', ar: 'تونس' }, lat: 36.8065, lng: 10.1815, timeZone: 'Africa/Tunis' },
  {
    id: 'algiers',
    name: { en: 'Algiers', ar: 'الجزائر' },
    lat: 36.7538,
    lng: 3.0588,
    timeZone: 'Africa/Algiers',
  },
  {
    id: 'casablanca',
    name: { en: 'Casablanca', ar: 'الدار البيضاء' },
    lat: 33.5731,
    lng: -7.5898,
    timeZone: 'Africa/Casablanca',
  },
  {
    id: 'rabat',
    name: { en: 'Rabat', ar: 'الرباط' },
    lat: 34.0209,
    lng: -6.8416,
    timeZone: 'Africa/Casablanca',
  },
  {
    id: 'istanbul',
    name: { en: 'Istanbul', ar: 'إسطنبول' },
    lat: 41.0082,
    lng: 28.9784,
    timeZone: 'Europe/Istanbul',
  },
  { id: 'tehran', name: { en: 'Tehran', ar: 'طهران' }, lat: 35.6892, lng: 51.389, timeZone: 'Asia/Tehran' },
  {
    id: 'karachi',
    name: { en: 'Karachi', ar: 'كراتشي' },
    lat: 24.8607,
    lng: 67.0011,
    timeZone: 'Asia/Karachi',
  },
  { id: 'lahore', name: { en: 'Lahore', ar: 'لاهور' }, lat: 31.5204, lng: 74.3587, timeZone: 'Asia/Karachi' },
  { id: 'dhaka', name: { en: 'Dhaka', ar: 'دكا' }, lat: 23.8103, lng: 90.4125, timeZone: 'Asia/Dhaka' },
  {
    id: 'kuala-lumpur',
    name: { en: 'Kuala Lumpur', ar: 'كوالالمبور' },
    lat: 3.139,
    lng: 101.6869,
    timeZone: 'Asia/Kuala_Lumpur',
  },
  {
    id: 'jakarta',
    name: { en: 'Jakarta', ar: 'جاكرتا' },
    lat: -6.2088,
    lng: 106.8456,
    timeZone: 'Asia/Jakarta',
  },
  { id: 'london', name: { en: 'London', ar: 'لندن' }, lat: 51.5074, lng: -0.1278, timeZone: 'Europe/London' },
  { id: 'paris', name: { en: 'Paris', ar: 'باريس' }, lat: 48.8566, lng: 2.3522, timeZone: 'Europe/Paris' },
  { id: 'berlin', name: { en: 'Berlin', ar: 'برلين' }, lat: 52.52, lng: 13.405, timeZone: 'Europe/Berlin' },
  {
    id: 'new-york',
    name: { en: 'New York', ar: 'نيويورك' },
    lat: 40.7128,
    lng: -74.006,
    timeZone: 'America/New_York',
  },
  {
    id: 'toronto',
    name: { en: 'Toronto', ar: 'تورونتو' },
    lat: 43.6532,
    lng: -79.3832,
    timeZone: 'America/Toronto',
  },
  {
    id: 'sydney',
    name: { en: 'Sydney', ar: 'سيدني' },
    lat: -33.8688,
    lng: 151.2093,
    timeZone: 'Australia/Sydney',
  },
];
