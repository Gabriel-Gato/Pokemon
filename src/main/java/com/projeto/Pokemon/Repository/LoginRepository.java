package com.projeto.Pokemon.Repository;

import com.projeto.Pokemon.Model.Login;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginRepository extends JpaRepository <Login, Long> {
        boolean existsByEmail(String email);
        Login findByEmail(String email);
}
