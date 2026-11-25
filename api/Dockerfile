# ---------- Stage 1: build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy only the project file first and restore NuGet packages.
# Docker caches this layer, so packages are downloaded again only when the .csproj changes.
COPY Northline.Api.csproj ./
RUN dotnet restore

# Now copy the rest of the code and publish a Release build
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# ---------- Stage 2: run ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# .NET images listen on port 8080 and include a non-root user; run as that user for safety
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Northline.Api.dll"]