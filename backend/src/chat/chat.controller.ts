import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Headers,
    Query,
    BadRequestException,
    UseGuards,
    Req,
    UnauthorizedException
} from '@nestjs/common';
import {ChatService} from './chat.service';
import {ChatDto} from './chat.dto';
import {JWTAuthGuard} from 'src/auth/guards/auth-jwt.guard';
import {Request} from 'express'

@UseGuards(JWTAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) {
    }

    @Get('/:chatName/users')
    async getChatUsers(@Param('chatName') chatName: string) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
        } catch {
            throw new BadRequestException("Chat not found")
        }
        return (await this.chatService.getChatUsers(Number(chatId)))
    }

    @Get('/joinableChats')
    async getAllChat(@Query('userName') userName: string) {
        try {
            var userId = await this.chatService.getSafeUserId(userName);
        } catch {
            throw new BadRequestException("User not found")
        }

        return (await this.chatService.getUserJoinableChats(userId))
    }

    @Get('/isChat')
    async getOneChat(@Query('chatName') chatName: string) {
        try {
            await this.chatService.getSafeChatId(chatName);
        } catch {
            return false
        }
        return true
    }

    @Get('/joinChat')
    async joinChat(@Headers('chatName') chatName: string,
                   @Headers('userName') userName: string,
                   @Headers('password') password: string) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
            var userId = await this.chatService.getSafeUserId(userName)
        } catch {
            throw new BadRequestException("Chat or user not found")
        }
        return await this.chatService.joinChat(chatId, userId, password);
    }

    @Get('/leave')
    async leaveChat(@Headers('chatName') chatName: string,
                    @Headers('userName') userName: string) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
            var userId = await this.chatService.getSafeUserId(userName)
        } catch {
            throw new BadRequestException("Chat or user not found")
        }

        await this.chatService.leaveChat(chatId, userId);
    }

    @Get('/:chat/public')
    async isPrivate(@Param('chat') chatName: string) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
        } catch {
            throw new BadRequestException("Chat not found")
        }

        return await this.chatService.isPrivate(Number(chatId))
    }

    @Get('/user/:login')
    async getUserChatsName(@Param('login') login: string) {
        try {
            let userId = await this.chatService.getSafeUserId(login)
        } catch {
            throw new BadRequestException("User not found")
        }

        return (await this.chatService.getUserChatsName(login))
    }

    @Get('/:chat/messages')
    async getMessageHistory(@Param('chat') chat: string,
                            @Req() req: Request) {
        try {
            var userId = req['user'].id;
            var chatId = await this.chatService.getSafeChatId(chat)
        } catch {
            throw new BadRequestException("Chat not found")
        }

        return (await this.chatService.getChatMessages(chatId, userId));
    }

    @Get('isUserInChat/:chat')
    async isUserInChat(@Param('chat') chatName: string,
                       @Query('user') userName: string) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
        } catch {
            throw new BadRequestException("Chat not found")
        }
        try {
            var userId = await this.chatService.getSafeUserId(userName)
        } catch (ex) {
            return false;
        }

        return (await this.chatService.isUserInChat(chatId, userId));
    }

    @Get('/:chat/isAdmin')
    async isAdmin(@Query('user') username: string,
                  @Param('chat') chatName: string) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
            var userId = await this.chatService.getSafeUserId(username)
        } catch {
            throw new BadRequestException("Chat or users not found")
        }
        if (!(await this.isUserInChat(chatName, username)))
            throw new BadRequestException("You are not member of this chat")

        return (this.chatService.isAdmin(chatId, userId));
    }

    @Post('create') // input validation
    async createChat(@Body() newChat: ChatDto) {
        if (!newChat.name || !newChat.owner)
            throw new BadRequestException('Error in input data')
        if (await this.chatService.findChat(newChat.name))
            throw new UnauthorizedException('A channel with this name already exist')
        if (newChat.name.search("/[^a-zA-Z0-9_]/") != -1)
            throw new BadRequestException("Allowed characters are: a-z, A-Z, 0-9, _")
        if (newChat.private == true && (newChat.password == null || newChat.password == ""))
            throw new BadRequestException("Password must be set for private chat")
        try {
            const ownerId = await this.chatService.getSafeUserId(newChat.owner)
            return await this.chatService.createChat(newChat, ownerId)
        } catch (ex) {
            return {error: ex.message}
        }
    }

    @Get('isChat')
    async isChatExist(@Query('chatName') chatName: string) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
        } catch {
            throw new BadRequestException("Chat not found")
        }

        return await this.chatService.findChat(chatName)
    }

    @Patch('/:chatName/kick/:toUser')
    async kickUser(@Param('chatName') chatName: string,
                   @Param('toUser') toUser: string,
                   @Req() req: Request) {
        const fromUser = req['user'].username
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
            var toUserId = await this.chatService.getSafeUserId(toUser)
            var fromUserId = await this.chatService.getSafeUserId(fromUser)
        } catch {
            throw new BadRequestException("Chat or users not found");
        }
        if (await this.chatService.isAdmin(Number(chatId), fromUserId) == false)
            throw new UnauthorizedException('User has to be an administrator!');
        if (await this.chatService.isOwner(chatId, toUserId))
            return 'Can\'t kick the owner';
        await this.chatService.kickUser(chatId, toUserId)
    }

    @Patch('/:chatName/changeRights/:toUser')
    async changeUserStatus(@Param('chatName') chatName: string,
                           @Query('newStatus') newStatus: string,
                           @Param('toUser') toUser: string,
                           @Req() req: Request) {
        const fromUser = req['user'].username;
        try {
            var chatId = await this.chatService.getSafeChatId(chatName)
            var toUserId = await this.chatService.getSafeUserId(toUser)
            var fromUserId = await this.chatService.getSafeUserId(fromUser)
        } catch {
            throw new BadRequestException("Chat or users not found")
        }
        if (await this.chatService.isOwner(chatId, toUserId))
            return "Cannot change owner's status"
        var ret
        if (await this.chatService.isAdmin(Number(chatId), fromUserId)) {
            switch (newStatus) {
                case 'mute':
                    ret = await this.chatService.setUserMute(Number(chatId), toUserId, true);
                    break;
                case 'unmute':
                    ret = await this.chatService.setUserMute(Number(chatId), toUserId, false);
                    break;
                case 'setadmin':
                    ret = await this.chatService.setUserAdmin(Number(chatId), toUserId, true);
                    break;
                case 'unsetadmin':
                    ret = await this.chatService.setUserAdmin(Number(chatId), toUserId, false);
                    break;
            }
        } else {
            throw new UnauthorizedException('User is not an admin!');
        }
        return ret;
    }

    @Patch('/:chatName/password')
    async setPassword(
        @Param('chatName') chatName: string,
        @Body() setPasswordDto: { password: string },
        @Req() req: Request) {
        try {
            var chatId = await this.chatService.getSafeChatId(chatName);
            var fromUserId = await this.chatService.getSafeUserId(req['user'].username)
        } catch {
            throw new BadRequestException("Chat or admin user not found");
        }
        if (await this.chatService.isAdmin(Number(chatId), fromUserId) == false)
            throw new UnauthorizedException('User has to be an administrator!');
        await this.chatService.setPassword(chatId, setPasswordDto.password);
        return setPasswordDto.password == '' ? "Password deleted" : "Password set successfully";
    }

}
