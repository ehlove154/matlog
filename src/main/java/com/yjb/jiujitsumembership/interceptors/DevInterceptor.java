package com.yjb.jiujitsumembership.interceptors;


import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class DevInterceptor implements HandlerInterceptor {
    @Autowired
    private UserMapper userMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        System.out.println(userMapper == null);

        Object signedUserObject = request.getSession().getAttribute("signedUser");
        if (!(signedUserObject instanceof UserEntity)) {
//            UserEntity signedUser = UserEntity.builder()
//                    .email("admin@sample.com")
//                    .nickname("admin")
//                    .build();

            UserEntity signedUser = this.userMapper.selectByEmail("master@matlog.com");
            request.getSession().setAttribute("signedUser", signedUser);
        }
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }
}
