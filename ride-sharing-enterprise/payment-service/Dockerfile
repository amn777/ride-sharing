FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build

# Copy parent pom + common module first (cache layer)
COPY pom.xml .
COPY common/pom.xml common/
COPY common/src common/src
COPY payment-service/pom.xml payment-service/

# Download dependencies
RUN mvn -pl common,payment-service dependency:go-offline -q

# Copy service source and build
COPY payment-service/src payment-service/src
RUN mvn -pl common,payment-service package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=build /build/payment-service/target/*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
