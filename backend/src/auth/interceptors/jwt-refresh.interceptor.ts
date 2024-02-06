// import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { RefreshTokenService } from './refresh-token.service';

// @Injectable()
// export class JwtRefreshInterceptor implements NestInterceptor {
//   constructor(private readonly refreshTokenService: RefreshTokenService) {}

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

//     const request = context.switchToHttp().getRequest();
//     const token = request.req.headers.cookies['jwt-token'];
// 	console.log('JWT refresh, token: ' + token);
	
//     // If the token is expired, refresh it and update the request headers with the new token.
//     if (isTokenExpired) {
//       return this.refreshTokenService.refreshExpiredToken(token).pipe(
//         tap((newToken: string) => {
//           request.headers.authorization = `Bearer ${newToken}`;
//         }),
//         // Continue the request chain
//         switchMap(() => next.handle()),
//       );
//     } else {
//       // If the token is not expired, continue the request chain.
//       return next.handle();
//     }
//   }

//   // Implement your own logic to check if the token is expired.
//   // You can use libraries like 'jsonwebtoken' to do this.
//   // private checkIfTokenExpired(token: string): boolean {
//   //   ...
//   // }
// }