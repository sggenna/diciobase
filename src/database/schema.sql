
DROP TABLE IF EXISTS Verbete CASCADE;
DROP TABLE IF EXISTS ElementoMicroestrutura CASCADE;
DROP TABLE IF EXISTS TipoDicionario CASCADE;
DROP TABLE IF EXISTS Elemento CASCADE;
DROP TABLE IF EXISTS Microestrutura CASCADE;
DROP TABLE IF EXISTS Dicionario CASCADE;
DROP TABLE IF EXISTS Tipo CASCADE;


CREATE TABLE Tipo (
    idTipo INT PRIMARY KEY,
    deTipo VARCHAR(300)
);

CREATE TABLE Dicionario (
    idDicionario INT PRIMARY KEY,
    deDicionario VARCHAR(300)
);

CREATE TABLE Microestrutura (
    idMicroestrutura INT PRIMARY KEY,
    deMicroestrutura VARCHAR(300),
    idDicionario INT
);

CREATE TABLE Elemento (
    idElemento INT PRIMARY KEY,
    deElemento VARCHAR(300)
);

CREATE TABLE ElementoMicroestrutura (
    idElemento INT,
    idMicroestrutura INT,
    PRIMARY KEY (idElemento, idMicroestrutura)
);

CREATE TABLE Verbete (
    idElemento INT,
    idMicroestrutura INT,
    idVerbete INT,
    deVerbete VARCHAR(300),
    PRIMARY KEY (idMicroestrutura, idElemento, idVerbete)
);

CREATE TABLE TipoDicionario (
    idTipo INT,
    idDicionario INT,
    PRIMARY KEY (idTipo, idDicionario)
);


ALTER TABLE Microestrutura ADD FOREIGN KEY(idDicionario) REFERENCES Dicionario(idDicionario);
ALTER TABLE ElementoMicroestrutura ADD FOREIGN KEY(idElemento) REFERENCES Elemento(idElemento);
ALTER TABLE ElementoMicroestrutura ADD FOREIGN KEY(idMicroestrutura) REFERENCES Microestrutura(idMicroestrutura);
ALTER TABLE Verbete ADD FOREIGN KEY(idElemento) REFERENCES Elemento(idElemento);
ALTER TABLE Verbete ADD FOREIGN KEY(idMicroestrutura) REFERENCES Microestrutura(idMicroestrutura);
ALTER TABLE TipoDicionario ADD FOREIGN KEY(idTipo) REFERENCES Tipo(idTipo);
ALTER TABLE TipoDicionario ADD FOREIGN KEY(idDicionario) REFERENCES Dicionario(idDicionario);


INSERT INTO Tipo VALUES (1, 'Dicionário de Topônimos');

INSERT INTO Dicionario VALUES (1, 'DTMS');
INSERT INTO TipoDicionario VALUES (1, 1);

INSERT INTO Microestrutura VALUES (1, 'Microestrutura de Topônimos', 1);

INSERT INTO Elemento(idElemento, deElemento) VALUES (1, 'Lema');
INSERT INTO Elemento(idElemento, deElemento) VALUES (2, 'Estrutura Morfológica');
INSERT INTO Elemento(idElemento, deElemento) VALUES (3, 'Categoria Gramatical');

INSERT INTO ElementoMicroestrutura(idMicroestrutura, idElemento) VALUES (1, 1);
INSERT INTO ElementoMicroestrutura(idMicroestrutura, idElemento) VALUES (1, 2);
INSERT INTO ElementoMicroestrutura(idMicroestrutura, idElemento) VALUES (1, 3);

INSERT INTO Verbete(idMicroestrutura, idElemento, idVerbete, deVerbete) VALUES (1, 1, 1, 'Paranaguá');
INSERT INTO Verbete(idMicroestrutura, idElemento, idVerbete, deVerbete) VALUES (1, 2, 1, 'Simples');
INSERT INTO Verbete(idMicroestrutura, idElemento, idVerbete, deVerbete) VALUES (1, 3, 1, 'Substantivo');

INSERT INTO Verbete(idMicroestrutura, idElemento, idVerbete, deVerbete) VALUES (1, 1, 2, 'Araguaia');
INSERT INTO Verbete(idMicroestrutura, idElemento, idVerbete, deVerbete) VALUES (1, 2, 2, 'Simples');
INSERT INTO Verbete(idMicroestrutura, idElemento, idVerbete, deVerbete) VALUES (1, 3, 2, 'Substantivo');

SELECT M.idMicroestrutura, M.deMicroestrutura, E.idElemento, E.deElemento 
FROM ElementoMicroestrutura EM
INNER JOIN Microestrutura M ON EM.idMicroestrutura = M.idMicroestrutura
INNER JOIN Elemento E ON EM.idElemento = E.idElemento;


SELECT
    T.deTipo AS TipoDicionario,
    D.deDicionario AS dicionario,
    M.deMicroestrutura AS microestrutura,
    E.deElemento AS Elemento,
    V.idVerbete AS idVerbete,
    V.deVerbete AS conteudo
FROM Tipo T
INNER JOIN TipoDicionario TD ON T.idTipo = TD.idTipo
INNER JOIN Dicionario D ON TD.idDicionario = D.idDicionario
INNER JOIN Microestrutura M ON D.idDicionario = M.idDicionario
INNER JOIN ElementoMicroestrutura EM ON M.idMicroestrutura = EM.idMicroestrutura
INNER JOIN Elemento E ON EM.idElemento = E.idElemento
INNER JOIN Verbete V ON V.idMicroestrutura = EM.idMicroestrutura AND V.idElemento = EM.idElemento
WHERE V.idVerbete = 1
ORDER BY D.deDicionario, M.deMicroestrutura, E.idElemento, V.deVerbete;

SELECT
    V1.idVerbete,
    MAX(CASE WHEN E.deElemento = 'Lema' THEN V1.deVerbete END) AS Lema,
    MAX(CASE WHEN E.deElemento = 'Estrutura Morfológica' THEN V1.deVerbete END) AS Estrutura_Morfologica,
    MAX(CASE WHEN E.deElemento = 'Categoria Gramatical' THEN V1.deVerbete END) AS Categoria_Gramatical
FROM Verbete V1
JOIN Elemento E ON V1.idElemento = E.idElemento
WHERE V1.idMicroestrutura = 1
GROUP BY V1.idVerbete
ORDER BY V1.idVerbete;