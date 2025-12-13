const Card = ({ title, value }) => {
  return (
    <div style={styles.card}>
      <h4 style={styles.title}>{title}</h4>
      <p style={styles.value}>{value}</p>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    width: "220px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  title: {
    margin: "0 0 10px 0",
    color: "#555"
  },
  value: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1976d2"
  }
};

export default Card;
