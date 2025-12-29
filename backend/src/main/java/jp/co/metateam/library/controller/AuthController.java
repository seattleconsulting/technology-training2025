package jp.co.metateam.library.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jp.co.metateam.library.model.Account;
import jp.co.metateam.library.model.AccountDto;
import jp.co.metateam.library.service.AccountPrincipal;
import jp.co.metateam.library.service.AccountService;
import jp.co.metateam.library.values.AuthorizationTypes;

/**
 * 認証・アカウント関連の REST API
 */
@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AccountService accountService;

    public AuthController(AuthenticationManager authenticationManager, AccountService accountService) {
        this.authenticationManager = authenticationManager;
        this.accountService = accountService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                request.email(),
                request.password());
        Authentication authentication = authenticationManager.authenticate(authToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        HttpSession session = servletRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

        AccountPrincipal principal = (AccountPrincipal) authentication.getPrincipal();

        return ResponseEntity.ok(new LoginResponse(AccountSummary.from(principal.getAccount()), session.getId()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AccountPrincipal principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("errors", List.of(Map.of("field", "authorization", "message", "サインインが必要です"))));
        }
        return ResponseEntity.ok(AccountSummary.from(principal.getAccount()));
    }

    @GetMapping("/authorization-types")
    public List<AuthorizationTypeResponse> authorizationTypes() {
        return Arrays.stream(AuthorizationTypes.values())
                .map(value -> new AuthorizationTypeResponse(value.getValue(), value.getText()))
                .collect(Collectors.toList());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        AccountDto dto = new AccountDto();
        dto.setEmail(request.email());
        dto.setName(request.name());
        dto.setEmployeeId(request.employeeId());
        dto.setPassword(request.password());
        dto.setAuthorizationType(request.authorizationType());

        Account existingEmail = accountService.findByEmail(dto.getEmail());
        if (existingEmail != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors",
                            List.of(Map.of("field", "email", "message", "登録済みのメールアドレスです"))));
        }

        Account existingEmployee = accountService.findByEmployeeId(dto.getEmployeeId());
        if (existingEmployee != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors",
                            List.of(Map.of("field", "employeeId", "message", "登録済みの社員番号です"))));
        }

        accountService.save(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AccountSummary.from(accountService.findByEmployeeId(dto.getEmployeeId())));
    }

    public record LoginRequest(
            @NotEmpty @Email String email,
            @NotEmpty String password) {
    }

    public record RegisterRequest(
            @NotEmpty @Size(max = 50) String employeeId,
            @NotEmpty @Size(max = 255) String name,
            @NotEmpty @Email String email,
            @NotEmpty @Size(min = 5) String password,
            @NotNull Integer authorizationType) {
    }

    public record LoginResponse(AccountSummary account, String token) {
    }

    public record AccountSummary(
            String employeeId,
            String name,
            String email,
            Integer authorizationType) {

        public static AccountSummary from(Account account) {
            return new AccountSummary(
                    account.getEmployeeId(),
                    account.getName(),
                    account.getEmail(),
                    account.getAuthorizationType());
        }
    }

    public record AuthorizationTypeResponse(Integer code, String label) {
    }
}
