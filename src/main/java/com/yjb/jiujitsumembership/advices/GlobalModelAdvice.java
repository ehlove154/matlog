package com.yjb.jiujitsumembership.advices;

import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.UserEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.SessionAttribute;

@ControllerAdvice
public class GlobalModelAdvice {
    @ModelAttribute
    public void addSingedUser (@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                               Model model) {
        model.addAttribute("signedUser", signedUser);
    }

    @ModelAttribute
    public void addUserBelt (@SessionAttribute(value = "userDto", required = false)UserDto userDto, Model model) {
        model.addAttribute("userDto", userDto);
    }
}
