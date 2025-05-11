# Mein To-Do App Projekt 📝

Eine selbst programmierte To-Do App, inspiriert von modernen Task-Managern.

## 🚀 Features

- Aufgaben erstellen, bearbeiten, verschieben und löschen.
- Aufgabenliste speichern (in einer MySQL Datenbank).
- Einfache und intuitive Benutzeroberfläche.

## 1. Projekt kopieren
## 2. In deinen Ordner wechseln
- cd "deinProjektName"

## 3. Abhängigkeiten installieren

 - npm install

## 4. Programm starten

- npm start

### Programm erklärung

Main Programm: app.js Die Logik für das Frontend ist bewusst für Übungszwecke in einem File geschrieben worden und der Code nicht in mehrere Files aufgeteilt worden: -> app-spa-script.js unter scripts/app-spa-script.js. Das ist der Kern dieses Projekts. Das app-spa-script.js wird im HTML Code in todo-app.ejs im head tag inkludiert und dieses ist dann das Hauptprogramm für das Frontend in der Todo App. Das app.js script ist der Einstiegspunkt um die Webapp zu starten. Das styling wurde hauptsächlich in mehreren CSS files durchgeführt, wobei hier auch auf Vanilla CSS gesetzt wurde

Es gibt 3 Main Routes (API Endpoints): 
1) Authentifizierung
2) Tasks
3) Comments

Das Programm ist auch nach einem MVC Pattern aufgebaut und besitzt Hilfsfunktionen als Middlewares, wie sessionConfig im Folder middleware

Hierbei handelt es sich um eine Single Page Application in Vanilla JS (Frontend), welche von einem Web-Server (JS in Node.js geschrieben), gerendert wird und API Requests bearbeitet. Hierbei handelt sich um eine App die mit dem Backend gekoppelt ist. Das heißt das die CORS-Policy hier auch aktiv ist. Das Backend läuft unter Node.js, wo die Logik auch in JS programmiert ist.

Bei der url Abfrage "http://localhost:3000" bekommt man eine klassischen Einstiegsseite, dort kann man sich weiter dann registrieren und anmelden. Nach erfolgreichem Login, wird man auf die eigentliche SPA Seite weiter geleitet und dort kann man seine Tasks anlegen.

Das Ziel dieses Projektes war es den Umgang mit JavaScript in größeren Projekten zu üben und eine praktische Webapp nur mit JavaScript zu programmieren, mit dem Potential für zukünftige Erweiterungen und Skalierbarkeit.

Verwendete Technologie Stack: HTML Vanilla CSS Vanilla JavaScript Node.js (mit libraries fürs Backend -> express, ...) zusätzliche Template Engine -> EJS MySQL

Es wurde bewusst auf Hardware näheren Programmiersprachen wie C++, Java oder Python verzichtet und nur mit Node.js das Backend implementiert. Also eine Full Stack App nur mit JavaScript.

## Was nicht implementiert wurde
Auf responsiv Design wurde verzichtet, wie auch auf einige Funktionalitäten von einigen Dummy Buttons

## Bugs
Diese App wurde auf mögliche Bugs überprüft, jedoch war dies nicht der Fokus dieses Projektes und daher sind weitere Bugs nicht auszuschließen.

## Persönliche Vorliebe
Man kann die Positionen der Tasks mit Drag und Drop verändern. Hier gibt es einen kleinen Bug, wenn man den ersten oder letzten Task verschiebt. Für V1 wurde dieser Bug noch nicht behoben.

Um das beste Nutzererlebnis zu bekommen, empfehle ich Google Chrome zu verwenden.
