# Medical Record Service Dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY medical-record-service ./medical-record-service
RUN mvn clean package -pl medical-record-service -am -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /app/medical-record-service/target/*.jar app.jar
USER spring:spring
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]

