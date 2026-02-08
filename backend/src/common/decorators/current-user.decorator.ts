import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/users/entities/user.entity';

/**
 * 현재 인증된 사용자를 추출하는 데코레이터
 *
 * @example
 * ```typescript
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * async getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
 *   return new UserResponseDto(user);
 * }
 *
 * // 특정 프로퍼티만 추출
 * @Get('my-id')
 * async getMyId(@CurrentUser('id') userId: string): Promise<string> {
 *   return userId;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
