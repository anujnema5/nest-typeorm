import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-interface.payload';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private jwtService: JwtService
    ) { }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.usersRepository.createUser(authCredentialsDto)
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const { password, username } = authCredentialsDto;
        const user = await this.usersRepository.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload: JwtPayload = { username };
            const accessToken = await this.jwtService.sign(payload);
            return { accessToken }
        } else {
            throw new UnauthorizedException('Please check your login credentials');
        }
    }
}
