import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHome() {
    return { status: 'ok', message: 'OX Backend is running' };
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.appService.getLeaderboard();
  }

  @Post('game-result')
  async recordResult(@Body() data: { username: string; result: 'WIN' | 'LOSS' | 'DRAW' }) {
    // ส่งค่า result ไปให้ Service คำนวณ Streak และคะแนน
    return this.appService.recordGameResult(data.username, data.result);
  }
}