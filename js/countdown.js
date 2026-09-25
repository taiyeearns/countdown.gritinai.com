/**
 * Countdown calculator for GritinAI Connect 2.0.
 * Conference Date: September 26, 2026.
 * Location: Benin City, Edo State.
 */

const CONFERENCE_DATE = new Date('2026-09-26T08:00:00+01:00'); // West Africa Time (WAT)

class CountdownEngine {
  constructor() {
    this.conferenceDate = CONFERENCE_DATE;
    this.overrideDays = null;
  }

  setOverrideDays(days) {
    this.overrideDays = days !== null && days !== undefined && !isNaN(days) ? Number(days) : null;
  }

  getDaysRemaining() {
    if (this.overrideDays !== null) {
      return this.overrideDays;
    }

    const now = new Date();
    // Normalize both dates to midnight local time to count full calendar days
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfConf = new Date(
      this.conferenceDate.getFullYear(),
      this.conferenceDate.getMonth(),
      this.conferenceDate.getDate()
    );

    const diffMs = startOfConf.getTime() - startOfToday.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getStatus() {
    const days = this.getDaysRemaining();

    if (days > 1) {
      return {
        type: 'countdown',
        days: days,
        numberDisplay: String(days),
        label: 'DAYS TO GO',
        headline: `${days} Days to Go`,
        subline: "We're almost there! Count down with us.",
        isEventDay: false,
        isPast: false
      };
    } else if (days === 1) {
      return {
        type: 'countdown',
        days: 1,
        numberDisplay: '1',
        label: '1 DAY TILL THE EVENT',
        headline: '1 Day till the Event',
        subline: 'Tomorrow is the big day! Get ready.',
        isEventDay: false,
        isPast: false
      };
    } else if (days === 0) {
      return {
        type: 'event_day',
        days: 0,
        numberDisplay: 'DAY 0',
        label: "HAPPENING TODAY, LIVE AT THE AI CONFERENCE",
        headline: "Happening Today, Live at the AI Conference",
        subline: 'See you there! Let’s make history.',
        isEventDay: true,
        isPast: false
      };
    } else {
      return {
        type: 'post_event',
        days: days,
        numberDisplay: 'DONE',
        label: 'EVENT CONCLUDED',
        headline: 'Thank you, Volunteers!',
        subline: 'GritinAI Connect 2.0 was a phenomenal success.',
        isEventDay: false,
        isPast: true
      };
    }
  }

  getEventInfo() {
    return {
      dateString: 'September 26, 2026',
      location: 'Benin City, Edo State',
      fullBadge: 'September 26, 2026 · Benin City, Edo State'
    };
  }
}

window.countdownEngine = new CountdownEngine();
