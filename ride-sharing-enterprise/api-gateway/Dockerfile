FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY pom.xml .
COPY common/pom.xml common/
COPY common/src common/src
COPY api-gateway/pom.xml api-gateway/
RUN mvn -pl common,api-gateway dependency:go-offline -q
COPY api-gateway/src api-gateway/src
RUN mvn -pl common,api-gateway package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=build /build/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
