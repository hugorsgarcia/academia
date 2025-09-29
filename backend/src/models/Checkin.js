const { Model } = require('objection');

class Checkin extends Model {
  static get tableName() {
    return 'checkins';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['student_id', 'checkin_time'],
      properties: {
        id: { type: 'integer' },
        student_id: { type: 'integer' },
        checkin_time: { type: 'string', format: 'date-time' },
        checkout_time: { type: 'string', format: 'date-time' },
        duration_minutes: { type: 'integer' },
        checkin_method: {
          type: 'string',
          enum: ['manual', 'qr_code', 'nfc', 'barcode', 'facial_recognition'],
          default: 'manual'
        },
        location: { type: 'string' },
        notes: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Student = require('./Student');

    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: Student,
        join: {
          from: 'checkins.student_id',
          to: 'students.id'
        }
      }
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // Virtual properties
  get isActive() {
    return this.checkin_time && !this.checkout_time;
  }

  get sessionDuration() {
    if (!this.checkout_time) return null;
    
    const checkinTime = new Date(this.checkin_time);
    const checkoutTime = new Date(this.checkout_time);
    return Math.round((checkoutTime - checkinTime) / (1000 * 60)); // in minutes
  }

  get formattedDuration() {
    const duration = this.duration_minutes || this.sessionDuration;
    if (!duration) return 'Em andamento';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  get checkinDate() {
    return new Date(this.checkin_time).toLocaleDateString('pt-BR');
  }

  get checkinTime() {
    return new Date(this.checkin_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get checkoutTime() {
    if (!this.checkout_time) return null;
    return new Date(this.checkout_time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Instance methods
  async checkout(notes = null) {
    if (this.checkout_time) {
      throw new Error('Check-out já foi realizado');
    }

    const checkoutTime = new Date();
    const duration = Math.round((checkoutTime - new Date(this.checkin_time)) / (1000 * 60));

    return await this.$query().patch({
      checkout_time: checkoutTime.toISOString(),
      duration_minutes: duration,
      notes: notes || this.notes
    });
  }

  async updateNotes(notes) {
    return await this.$query().patch({ notes });
  }

  // Static methods
  static findByStudent(studentId, startDate = null, endDate = null) {
    let query = this.query()
      .where('student_id', studentId)
      .orderBy('checkin_time', 'desc');

    if (startDate && endDate) {
      query = query.whereBetween('checkin_time', [startDate, endDate]);
    } else if (startDate) {
      query = query.where('checkin_time', '>=', startDate);
    } else if (endDate) {
      query = query.where('checkin_time', '<=', endDate);
    }

    return query;
  }

  static findActiveCheckins() {
    return this.query()
      .whereNull('checkout_time')
      .withGraphFetched('student.user')
      .orderBy('checkin_time', 'desc');
  }

  static findTodayCheckins() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.query()
      .whereBetween('checkin_time', [today.toISOString(), tomorrow.toISOString()])
      .withGraphFetched('student.user')
      .orderBy('checkin_time', 'desc');
  }

  static findByDateRange(startDate, endDate) {
    return this.query()
      .whereBetween('checkin_time', [startDate, endDate])
      .withGraphFetched('student.user')
      .orderBy('checkin_time', 'desc');
  }

  static async getCheckinStats(startDate = null, endDate = null) {
    let baseQuery = this.query();
    
    if (startDate && endDate) {
      baseQuery = baseQuery.whereBetween('checkin_time', [startDate, endDate]);
    }

    const total = await baseQuery.clone().count('* as count').first();
    const active = await this.query().whereNull('checkout_time').count('* as count').first();
    const completed = await baseQuery.clone().whereNotNull('checkout_time').count('* as count').first();

    // Average duration
    const avgDuration = await baseQuery.clone()
      .whereNotNull('duration_minutes')
      .avg('duration_minutes as avg_duration')
      .first();

    // Daily breakdown
    const dailyStats = await baseQuery.clone()
      .select(this.raw('DATE(checkin_time) as date'))
      .count('* as count')
      .avg('duration_minutes as avg_duration')
      .groupByRaw('DATE(checkin_time)')
      .orderBy('date', 'desc')
      .limit(30);

    // Peak hours
    const peakHours = await baseQuery.clone()
      .select(this.raw('HOUR(checkin_time) as hour'))
      .count('* as count')
      .groupByRaw('HOUR(checkin_time)')
      .orderBy('count', 'desc');

    // Most frequent visitors
    const frequentVisitors = await baseQuery.clone()
      .select('student_id')
      .count('* as visits')
      .join('students', 'checkins.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .select('users.name as student_name', 'students.registration_number')
      .groupBy('student_id', 'users.name', 'students.registration_number')
      .orderBy('visits', 'desc')
      .limit(10);

    return {
      total: parseInt(total.count),
      active: parseInt(active.count),
      completed: parseInt(completed.count),
      averageDuration: Math.round(parseFloat(avgDuration.avg_duration) || 0),
      dailyStats,
      peakHours,
      frequentVisitors
    };
  }

  static async getPeakHours(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.query()
      .select(this.raw('HOUR(checkin_time) as hour'))
      .count('* as count')
      .where('checkin_time', '>=', startDate.toISOString())
      .groupByRaw('HOUR(checkin_time)')
      .orderBy('hour');
  }

  static async getAttendancePattern(studentId, days = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const checkins = await this.query()
      .where('student_id', studentId)
      .where('checkin_time', '>=', startDate.toISOString())
      .select('checkin_time', 'duration_minutes')
      .orderBy('checkin_time');

    // Group by day of week
    const dayOfWeekStats = {};
    const hourStats = {};

    checkins.forEach(checkin => {
      const date = new Date(checkin.checkin_time);
      const dayOfWeek = date.getDay(); // 0 = Sunday
      const hour = date.getHours();

      dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
      hourStats[hour] = (hourStats[hour] || 0) + 1;
    });

    const totalVisits = checkins.length;
    const avgDuration = checkins.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / totalVisits;

    return {
      totalVisits,
      averageDuration: Math.round(avgDuration),
      preferredDays: Object.entries(dayOfWeekStats)
        .map(([day, count]) => ({
          dayOfWeek: parseInt(day),
          dayName: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][day],
          visits: count,
          percentage: Math.round((count / totalVisits) * 100)
        }))
        .sort((a, b) => b.visits - a.visits),
      preferredHours: Object.entries(hourStats)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          visits: count,
          percentage: Math.round((count / totalVisits) * 100)
        }))
        .sort((a, b) => b.visits - a.visits)
    };
  }

  static async checkDuplicateCheckin(studentId, date = null) {
    const checkDate = date || new Date();
    checkDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingCheckin = await this.query()
      .where('student_id', studentId)
      .whereBetween('checkin_time', [checkDate.toISOString(), nextDay.toISOString()])
      .first();

    return existingCheckin;
  }

  static async autoCheckoutOldSessions(hoursThreshold = 12) {
    const thresholdTime = new Date();
    thresholdTime.setHours(thresholdTime.getHours() - hoursThreshold);

    const oldSessions = await this.query()
      .whereNull('checkout_time')
      .where('checkin_time', '<', thresholdTime.toISOString());

    const checkoutPromises = oldSessions.map(async (session) => {
      const duration = Math.round((thresholdTime - new Date(session.checkin_time)) / (1000 * 60));
      return await session.$query().patch({
        checkout_time: thresholdTime.toISOString(),
        duration_minutes: duration,
        notes: `${session.notes || ''} (Auto checkout após ${hoursThreshold}h)`.trim()
      });
    });

    await Promise.all(checkoutPromises);
    return oldSessions.length;
  }
}

module.exports = Checkin;