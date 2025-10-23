package com.projeto.Pokemon.Controllers;


import com.projeto.Pokemon.Model.Login;
import com.projeto.Pokemon.Service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("api/login")
@CrossOrigin(origins = "*")
public class LoginController {
    @Autowired private LoginService loginService;

    @PostMapping("upload/{id}")
    public ResponseEntity<Login> uploadImagem(@PathVariable Long id, @RequestParam("imagem")MultipartFile imagem) throws IOException{
        Login atualizado = loginService.salvarImagem(id, imagem);
        return ResponseEntity.ok(atualizado);
    }

    @PostMapping
    public ResponseEntity<Login> cadastrarLogin(@RequestBody Login login){
        try{
            Login salvo = loginService.cadastrar(login);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }


    @GetMapping
    public ResponseEntity<List<Login>> listarLogin(){
        return ResponseEntity.ok(loginService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Login> buscaPorID(@PathVariable Long id){
        Login login = loginService.buscarPorId(id);
        if (login != null){
            return ResponseEntity.ok(login);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/imagem/{nomeImagem}")
    public ResponseEntity<byte[]> obterImagem(@PathVariable String nomeImagem)
        throws IOException {
        File imagem = new File("uploads/usuarios/" + nomeImagem);
        if(!imagem.exists()) {
            return ResponseEntity.notFound().build();
        }

        byte[] conteudo = Files.readAllBytes(imagem.toPath());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        return new ResponseEntity<>(conteudo, headers, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Login> atualizarLogin(@PathVariable long id, @RequestBody Login login) {
        Login atualizado = loginService.atualizar(id, login);
        if (atualizado != null){
            return ResponseEntity.ok(atualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Login> login(@RequestBody Login loginRequest) {
        Login autenticado = loginService.autenticar(loginRequest.getEmail(), loginRequest.getSenha());
        if (autenticado != null) {
            return ResponseEntity.ok(autenticado);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("email/{email}")
    public ResponseEntity<Login> buscarPorEmail(@PathVariable String email){
        Login login = loginService.buscarPorEmail(email);
        return login != null ? ResponseEntity.ok(login) : ResponseEntity.notFound().build();
    }

    @PatchMapping("email/{email}")
    public ResponseEntity<Login> atualizarParcial(@PathVariable String email, @RequestBody Login atualizacao) {
        Login loginExistente = loginService.buscarPorEmail(email);
        if (loginExistente == null) {
            return ResponseEntity.notFound().build();
        }

        if (atualizacao.getNome() != null) {
            loginExistente.setNome(atualizacao.getNome());
        }
        if (atualizacao.getSenha() != null) {
            loginExistente.setSenha(atualizacao.getSenha());
        }

        Login atualizado = loginService.salvar(loginExistente);
        return ResponseEntity.ok(atualizado);
    }


    @DeleteMapping("/email/{email}")
    public ResponseEntity<Void> deletarPorEmail(@PathVariable String email){
        Login login = loginService.buscarPorEmail(email);
        if(login == null){
            return ResponseEntity.notFound().build();
        }

        loginService.deletar(login);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarLogin(@PathVariable long id){
        try {
            loginService.deletarPorId(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao deletar login" + e.getMessage());
        }
    }



}
