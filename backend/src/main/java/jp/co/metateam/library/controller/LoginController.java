package jp.co.metateam.library.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * ログイン関連クラス
 */
@Controller
public class LoginController {

    @GetMapping("/login")
    @ResponseBody
    public Map<String, Object> login() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "ログインページへようこそ");
        response.put("status", "success");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    @GetMapping("/")
    public String redirectToIndex() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:book/index";
        }
        return "redirect:/login";
    }
}


