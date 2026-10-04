import { useState, useEffect } from 'react';
import axios from 'axios';

const Teste = () => {
  const [data, setData] = useState([]);

  const consultaAleatoria = async () =>{
    try {
        const response =await axios.get("http://localhost:3042/consultaAleatoria");
        console.log(response.data);
        setData(response.data);

    }catch (error) {
        console.log(error);

    }
  }

  useEffect(() => {
    consultaAleatoria();
  }, []);



//   useEffect(() => {
//     axios.get('http://localhost:3010/consultaAleatoria')
//       .then(response => {
//         setData =response.data;
//         console.log(response.data);
        
//       })
//       .catch(error => {
//         console.error('Houve um erro!', error);
//       });
//   }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div style={styles.container}>
        
     
        <div style={styles.texto}>
            <p>{data.numero}</p>
        </div> 
        <div style={styles.texto}>
            <p>{data.tema}</p>
        </div> 
        <div style={styles.texto}>
            <p>{data.pergunta}</p>
        </div> 
        <div style={styles.texto}>
            <p>{data.A}</p>
        </div>
        <div style={styles.texto}>
            <p>{data.B}</p>
        </div>
        <div style={styles.texto}>
            <p>{data.C}</p>
        </div>
        <div style={styles.texto}>
            <p>{data.D}</p>
        </div>
        <div style={styles.texto}>
            <p>{data.correta}</p>
        </div>
        <div style={styles.texto}>
            <p>{data.imagem}</p>
        </div> 
      
          
        
      
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px',
  },
  text: {
    fontSize: '16px',
    marginBottom: '10px',
  },
};

export default Teste;
