import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  created_at?: string;
}

export interface Hike {
  id?: number;
  user_id: number;
  name: string;
  location: string;
  date: string;
  length: string;
  difficulty: string;
  parking_available: boolean;
  description: string;
  created_at?: string;
}

export interface Observation {
  id?: number;
  hike_id: number;
  type: string;
  name: string;
  time: string;
  comment: string;
  created_at?: string;
}

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private dbName = 'mhike.db';
  private isInitialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // For web platform, we need to initialize jeep-sqlite
      if (Capacitor.getPlatform() === 'web') {
        const jeepSqlite = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqlite);
        await customElements.whenDefined('jeep-sqlite');
        await this.sqlite.initWebStore();
      }

      // Check if connection exists
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(this.dbName, false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(this.dbName, false);
      } else {
        this.db = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.db.open();
      await this.createTables();
      this.isInitialized = true;

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hikes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        length TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        parking_available INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hike_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        time TEXT NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hike_id) REFERENCES hikes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_hikes_user_id ON hikes(user_id);
      CREATE INDEX IF NOT EXISTS idx_observations_hike_id ON observations(hike_id);
    `;

    await this.db.execute(createTablesSQL);
  }

  // User operations
  async createUser(user: User): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO users (email, password, name)
      VALUES (?, ?, ?)
    `;

    const result = await this.db.run(query, [user.email, user.password, user.name]);
    
    if (result.changes?.lastId) {
      return result.changes.lastId;
    }
    throw new Error('Failed to create user');
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM users WHERE email = ?';
    const result = await this.db.query(query, [email]);

    if (result.values && result.values.length > 0) {
      return result.values[0] as User;
    }
    return null;
  }

  async getUserById(id: number): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await this.db.query(query, [id]);

    if (result.values && result.values.length > 0) {
      return result.values[0] as User;
    }
    return null;
  }

  // Hike operations
  async createHike(hike: Hike): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO hikes (user_id, name, location, date, length, difficulty, parking_available, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await this.db.run(query, [
      hike.user_id,
      hike.name,
      hike.location,
      hike.date,
      hike.length,
      hike.difficulty,
      hike.parking_available ? 1 : 0,
      hike.description || ''
    ]);

    if (result.changes?.lastId) {
      return result.changes.lastId;
    }
    throw new Error('Failed to create hike');
  }

  async getHikesByUserId(userId: number): Promise<Hike[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM hikes WHERE user_id = ? ORDER BY date DESC';
    const result = await this.db.query(query, [userId]);

    if (result.values) {
      return result.values.map(row => ({
        ...row,
        parking_available: row.parking_available === 1
      })) as Hike[];
    }
    return [];
  }

  async getHikeById(id: number): Promise<Hike | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM hikes WHERE id = ?';
    const result = await this.db.query(query, [id]);

    if (result.values && result.values.length > 0) {
      const row = result.values[0];
      return {
        ...row,
        parking_available: row.parking_available === 1
      } as Hike;
    }
    return null;
  }

  async updateHike(id: number, hike: Partial<Hike>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updates: string[] = [];
    const values: any[] = [];

    if (hike.name !== undefined) {
      updates.push('name = ?');
      values.push(hike.name);
    }
    if (hike.location !== undefined) {
      updates.push('location = ?');
      values.push(hike.location);
    }
    if (hike.date !== undefined) {
      updates.push('date = ?');
      values.push(hike.date);
    }
    if (hike.length !== undefined) {
      updates.push('length = ?');
      values.push(hike.length);
    }
    if (hike.difficulty !== undefined) {
      updates.push('difficulty = ?');
      values.push(hike.difficulty);
    }
    if (hike.parking_available !== undefined) {
      updates.push('parking_available = ?');
      values.push(hike.parking_available ? 1 : 0);
    }
    if (hike.description !== undefined) {
      updates.push('description = ?');
      values.push(hike.description);
    }

    if (updates.length === 0) return;

    values.push(id);
    const query = `UPDATE hikes SET ${updates.join(', ')} WHERE id = ?`;
    await this.db.run(query, values);
  }

  async deleteHike(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'DELETE FROM hikes WHERE id = ?';
    await this.db.run(query, [id]);
  }

  async searchHikes(userId: number, searchTerm: string): Promise<Hike[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      SELECT * FROM hikes 
      WHERE user_id = ? AND (
        name LIKE ? OR 
        location LIKE ? OR 
        description LIKE ?
      )
      ORDER BY date DESC
    `;
    
    const term = `%${searchTerm}%`;
    const result = await this.db.query(query, [userId, term, term, term]);

    if (result.values) {
      return result.values.map(row => ({
        ...row,
        parking_available: row.parking_available === 1
      })) as Hike[];
    }
    return [];
  }

  // Observation operations
  async createObservation(observation: Observation): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO observations (hike_id, type, name, time, comment)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await this.db.run(query, [
      observation.hike_id,
      observation.type,
      observation.name,
      observation.time,
      observation.comment || ''
    ]);

    if (result.changes?.lastId) {
      return result.changes.lastId;
    }
    throw new Error('Failed to create observation');
  }

  async getObservationsByHikeId(hikeId: number): Promise<Observation[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM observations WHERE hike_id = ? ORDER BY time ASC';
    const result = await this.db.query(query, [hikeId]);

    return (result.values || []) as Observation[];
  }

  async deleteObservation(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'DELETE FROM observations WHERE id = ?';
    await this.db.run(query, [id]);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const database = new DatabaseService();
