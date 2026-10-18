# ── Stage 1: Build ──
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Run ──
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy the built JAR
COPY --from=build /app/target/backend-1.0.0.jar app.jar

# Expose port (Render uses PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8080}/swagger-ui.html || exit 1

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]
