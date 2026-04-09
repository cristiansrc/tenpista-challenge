# Stage 1: Build - Gradle con Java 21
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copiamos archivos de Gradle primero (cache de dependencias)
COPY gradlew .
COPY gradle gradle/
COPY build.gradle .
COPY settings.gradle .

RUN chmod +x gradlew

# Descargamos dependencias antes de copiar el código (mejor cache)
RUN ./gradlew dependencies --no-daemon || true

# Copiamos el código fuente y compilamos
COPY src src/
RUN ./gradlew clean build -x test --no-daemon

# Stage 2: Runtime - imagen ligera solo con JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
