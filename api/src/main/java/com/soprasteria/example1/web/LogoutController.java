package com.soprasteria.example1.web;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bff")
@RequiredArgsConstructor
public class LogoutController {

    private final ClientRegistrationRepository clients;

    @PostMapping("/logout")
    public Map<String, String> spaLogout(
            @AuthenticationPrincipal org.springframework.security.oauth2.core.oidc.user.OidcUser user,
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws Exception {
        // 1) Bygg end-session URL før vi nuller ut auth
        String idToken = (user != null) ? user.getIdToken().getTokenValue() : null;

        var reg = ((InMemoryClientRegistrationRepository) clients)
                .findByRegistrationId("keycloak"); // samme id som i application.yml

        // issuer fra provider metadata
        String issuer = reg.getProviderDetails().getIssuerUri();
        String endSession = issuer + "/protocol/openid-connect/logout";

        // post-logout landingsside (må være tillatt i Keycloak)
        String postLogout = "http://localhost:3000";

        StringBuilder endSessionUrl = new StringBuilder(endSession);
        boolean first = true;
        if (idToken != null) {
            endSessionUrl.append(first ? "?" : "&")
                    .append("id_token_hint=")
                    .append(java.net.URLEncoder.encode(idToken, java.nio.charset.StandardCharsets.UTF_8));
            first = false;
        }
        endSessionUrl.append(first ? "?" : "&")
                .append("post_logout_redirect_uri=")
                .append(java.net.URLEncoder.encode(postLogout, java.nio.charset.StandardCharsets.UTF_8));

        // 2) Lokal logout i Spring (invalider session + cookies)
        new org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler()
                .logout(request, response, authentication);

        // 3) Returner URL til frontend (ikke redirect her – unngå CORS)
        return java.util.Map.of("endSessionUrl", endSessionUrl.toString());
    }
}
