package com.hirelens.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret:}")
    private String configuredSecret;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void initKey() {
        if (configuredSecret != null && !configuredSecret.trim().isEmpty()) {
            try {
                // If it's a valid Base64 string of at least 256 bits
                byte[] keyBytes = Decoders.BASE64.decode(configuredSecret.trim());
                if (keyBytes.length >= 32) {
                    this.signingKey = Keys.hmacShaKeyFor(keyBytes);
                    log.info("Initialized JWT signing key from configured Base64 secret.");
                    return;
                }
            } catch (Exception ignored) {
                // Fall back to UTF-8 bytes if not valid Base64
            }

            byte[] utf8Bytes = configuredSecret.trim().getBytes(StandardCharsets.UTF_8);
            if (utf8Bytes.length >= 32) {
                this.signingKey = Keys.hmacShaKeyFor(utf8Bytes);
                log.info("Initialized JWT signing key from UTF-8 string.");
                return;
            }
        }

        // If no secret is configured in the environment, generate a cryptographically secure key for local session
        this.signingKey = Jwts.SIG.HS256.key().build();
        log.info("No JWT_SECRET provided in environment. Generated secure in-memory signing key for local development.");
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
            .claims(extraClaims)
            .subject(userDetails.getUsername())
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(signingKey)
            .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
