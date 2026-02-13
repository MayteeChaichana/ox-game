import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class AppService implements OnModuleInit {
  private db: mysql.Pool;

  async onModuleInit() {
    try {
      this.db = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'password123',
        database: 'ox_db',
        port: 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      await this.db.getConnection();
      console.log('✅ [Database]: MySQL Connected Directly!');
    } catch (error) {
      console.error('❌ [Database]: Connection failed!', error.message);
    }
  }

  async recordGameResult(username: string, result: 'WIN' | 'LOSS' | 'DRAW') {
    const conn = await this.db.getConnection();
    await conn.beginTransaction();

    try {
      const [players]: any = await conn.query('SELECT * FROM Player WHERE username = ?', [username]);
      let player = players[0];

      if (!player) {
        await conn.query(
          'INSERT INTO Player (username, totalScore, winStreak, createdAt, updatedAt) VALUES (?, 0, 0, NOW(), NOW())',
          [username]
        );
        const [newPlayers]: any = await conn.query('SELECT * FROM Player WHERE username = ?', [username]);
        player = newPlayers[0];
      }

      let pointsToAdd = 0;
      let newWinStreak = player.winStreak;

      if (result === 'WIN') {
        pointsToAdd = 1;
        newWinStreak += 1;
        if (newWinStreak === 3) {
          pointsToAdd += 1; // Bonus +1 รวมเป็น +2
          newWinStreak = 0;
        }
      } else if (result === 'LOSS') {
        pointsToAdd = -1;
        newWinStreak = 0;
      } else {
        pointsToAdd = 0;
        newWinStreak = 0;
      }

      const newTotalScore = Math.max(0, (player.totalScore || 0) + pointsToAdd);
      
      await conn.query(
        'UPDATE Player SET totalScore = ?, winStreak = ?, updatedAt = NOW() WHERE id = ?',
        [newTotalScore, newWinStreak, player.id]
      );

      await conn.query(
        'INSERT INTO GameLog (player, result, points) VALUES (?, ?, ?)',
        [username, result, pointsToAdd]
      );

      await conn.commit();

      return { 
        username, 
        totalScore: newTotalScore, 
        winStreak: newWinStreak,
        pointsAdded: pointsToAdd 
      };

    } catch (error) {
      await conn.rollback();
      console.error('Transaction Error:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  async getLeaderboard() {
    const [rows] = await this.db.query(
      'SELECT username, totalScore FROM Player ORDER BY totalScore DESC'
    );
    return rows;
  }
}