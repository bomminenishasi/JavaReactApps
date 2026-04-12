package com.shopease.user.service;

import com.shopease.user.dto.AddressDto;
import com.shopease.user.dto.UpdateProfileRequest;
import com.shopease.user.dto.UserDto;
import com.shopease.user.entity.User;
import com.shopease.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto getUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getStreet() != null) user.setStreet(request.getStreet());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getZipCode() != null) user.setZipCode(request.getZipCode());
        if (request.getCountry() != null) user.setCountry(request.getCountry());

        return toDto(userRepository.save(user));
    }

    private UserDto toDto(User user) {
        AddressDto address = null;
        if (user.getStreet() != null) {
            address = AddressDto.builder()
                .street(user.getStreet()).city(user.getCity())
                .state(user.getState()).zipCode(user.getZipCode())
                .country(user.getCountry()).build();
        }
        return UserDto.builder()
            .id(user.getId()).email(user.getEmail())
            .firstName(user.getFirstName()).lastName(user.getLastName())
            .phone(user.getPhone()).address(address)
            .role(user.getRole()).createdAt(user.getCreatedAt())
            .build();
    }
}
