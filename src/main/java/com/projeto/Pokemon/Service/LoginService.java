package com.projeto.Pokemon.Service;

import com.projeto.Pokemon.Model.Login;
import com.projeto.Pokemon.Repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LoginService {
    @Autowired private LoginRepository loginRepository;
    @Autowired private PasswordEncoder passwordEncoder;


    public Login salvarImagem(Long id, MultipartFile file) throws IOException {
        String uploadDir = "uploads/usuarios";

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)){
            Files.createDirectories(uploadPath);
        }

        String nomeArquivo = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path caminho = uploadPath.resolve(nomeArquivo);
        Files.copy(
                file.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

        Login login = loginRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Usuario não encontrado"));

        login.setImagem(nomeArquivo);
        return loginRepository.save(login);
    }

    public Login cadastrar(Login login){
        if (loginRepository.existsByEmail(login.getEmail())){
            throw new IllegalArgumentException("Email já cadastrado");
        }

        login.setSenha(passwordEncoder.encode(login.getSenha()));

        return loginRepository.save(login);
    }


    public Login salvar(Login login){
        return loginRepository.save(login);
    }

    public List<Login> listarTodos(){
        return loginRepository.findAll();
    }

    public Login buscarPorEmail(String email){
        return loginRepository.findByEmail(email);
    }

    public Login buscarPorId(Long id){
        return loginRepository.findById(id).orElse(null);
    }

    public Login atualizar(Long id, Login loginAtualizado) {
        Optional<Login> existente = loginRepository.findById(id);
        if (existente.isPresent()) {
            Login login = existente.get();


            if (loginAtualizado.getNome() != null)
                login.setNome(loginAtualizado.getNome());
            if (loginAtualizado.getEmail() != null)
                login.setEmail(loginAtualizado.getEmail());
            if (loginAtualizado.getSenha() != null)
                login.setSenha(loginAtualizado.getSenha());
            if (loginAtualizado.getImagem() != null)
                login.setImagem(loginAtualizado.getImagem());

            return loginRepository.save(login);
        }

        return null;
    }


    public void deletar(Login login){
        loginRepository.delete(login);
    }

    public void deletarPorId(Long id){
        Login login = loginRepository.findById(id).orElseThrow(() -> new RuntimeException("Login não encontrado"));
        loginRepository.delete(login);
    }

    public Login autenticar(String email, String senha) {
        Login login = loginRepository.findByEmail(email);
        if (login != null && passwordEncoder.matches(senha, login.getSenha())) {
            return login;
        }
        return null;
    }





}
