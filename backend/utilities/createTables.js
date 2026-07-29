const mysql = require('mysql');
const cred = require('./credentials');

class TABLES {

    constructor() {

        this.db = mysql.createConnection({
            ...cred,
            database: 'library'
        });

        this.sql = {
            student: `
                CREATE TABLE IF NOT EXISTS STUDENT(
                    id INT AUTO_INCREMENT,
                    name VARCHAR(255),
                    fine FLOAT(6,2) DEFAULT 0,
                    PRIMARY KEY (id)
                )
            `,

            books: `
                CREATE TABLE IF NOT EXISTS BOOK(
                    id INT AUTO_INCREMENT,
                    name VARCHAR(255),
                    author VARCHAR(255),
                    semester INT,
                    count INT,
                    PRIMARY KEY (id)
                )
            `,

            borrow: `
                CREATE TABLE IF NOT EXISTS BORROW(
                    idStudent INT,
                    idBook INT,
                    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    deadline TIMESTAMP NULL,
                    PRIMARY KEY (idStudent, idBook),
                    FOREIGN KEY (idStudent) REFERENCES STUDENT(id),
                    FOREIGN KEY (idBook) REFERENCES BOOK(id)
                )
            `
        };

        this.sampleBooks = `
            INSERT INTO BOOK (name, author, semester, count)
            SELECT * FROM (
                SELECT 'Computer Networks', 'Andrew S. Tanenbaum', 5, 10 UNION ALL
                SELECT 'Operating Systems', 'Abraham Silberschatz', 5, 8 UNION ALL
                SELECT 'Database Management System', 'Raghu Ramakrishnan', 4, 12 UNION ALL
                SELECT 'Computer Graphics', 'Donald Hearn', 6, 7 UNION ALL
                SELECT 'Cryptography and Network Security', 'William Stallings', 7, 6
            ) AS tmp
            WHERE NOT EXISTS (SELECT 1 FROM BOOK);
        `;
    }

    initTable() {

        for (let i in this.sql) {

            this.db.query(this.sql[i], (err) => {

                if (err) {
                    console.log(err);
                } else {
                    console.log(`Successfully created table ${i}`);

                    if (i === "borrow") {
                        this.db.query(this.sampleBooks, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Sample books inserted successfully");
                            }
                        });
                    }
                }

            });

        }

    }

}

module.exports = TABLES;