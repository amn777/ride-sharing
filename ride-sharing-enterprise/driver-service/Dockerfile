FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build

# Copy parent pom + common module first (cache layer)
COPY pom.xml .
COPY common/pom.xml common/
COPY common/src common/src
COPY driver-service/pom.xml driver-service/

# Download dependencies
RUN mvn -pl common,driver-service dependency:go-offline -q

# Copy service source and build
COPY driver-service/src driver-service/src
RUN mvn -pl common,driver-service package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=build /build/driver-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
