import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Seller_answer } from "../../../Components/Modules/seller_answer/Seller_answer";
import "./chat.css";

const Chat = () => {
  const [questions, setQuestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const sellerId = localStorage.getItem("sellerId");
  console.log("sellerId:", sellerId);

  // Fetch questions based on sellerId
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `/api/productsreplyquestions?sellerId=${sellerId}`
        );
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (sellerId) {
      fetchQuestions();
    }
  }, [sellerId]);

  // Update answer for a question
  const handleUpdateAnswer = async (answer) => {
    try {
      await axios.put(
        `/api/productsreplyquestions/${selectedQuestion._id}`,
        {
          answer,
        }
      );
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === selectedQuestion._id ? { ...q, Answer: answer } : q
        )
      );

      setModalOpen(false);
    } catch (error) {
      console.error("Error updating answer:", error);
    }
  };

  if (!sellerId) {
    return <div>Please log in to view your questions.</div>;
  }
  const BACKEND_URL = `https://${window.location.hostname}:3000`;
  return (
    <div>
      <div className="seller-chat-container">
        <div className="seller-chat-tbl_content">
          <table className="seller-chat-tbl">
            <thead>
              <tr>
                <th></th>
                <th>Product Name</th>
                <th>Question</th>
                <th>Answer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question._id}>
                  <td>
                    {question.ProductID?.ImageFiles?.length > 0 && (
                      <img
                        className="seller-chat-table-image"
                        src={`${BACKEND_URL}/uploads/${question.ProductID.ImageFiles[0]}`}
                        alt={question.ProductID.ProductName || "Product Image"}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "1.jpg";
                        }}
                      />
                    )}
                  </td>
                  <td data-label="Product Name">
                    {question.ProductID.ProductName}
                  </td>
                  <td data-label="Question" className="seller-chat-qa">
                    {question.Question}
                  </td>
                  <td
                    data-label="Answer"
                    className={`seller-chat-qa ${question.Answer}`}
                  >
                    {question.Answer}
                  </td>
                  <td data-label="Action">
                    <button
                      className="seller-chat-btn_reply"
                      onClick={() => {
                        setSelectedQuestion(question);
                        setModalOpen(true);
                      }}
                    >
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen &&
        createPortal(
          <Seller_answer
            closeModal={() => setModalOpen(false)}
            onSubmit={(answer) => handleUpdateAnswer(answer)}
            onCancel={() => setModalOpen(false)}
          />,
          document.body
        )}
    </div>
  );
};

export default Chat;