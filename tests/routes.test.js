const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

chai.use(chaiHttp);
chai.should();

describe("Scheduler", () => {
  describe("POST /", () => {
    // Test to create message
    it("should create message", done => {
      chai
        .request(app)
        .post("/")
        .send({
          timestamp: 0,
          message: "Hello World!"
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it("should return wrong parameters error", done => {
      chai
        .request(app)
        .post("/")
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
