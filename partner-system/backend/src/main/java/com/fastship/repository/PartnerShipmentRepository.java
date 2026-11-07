package com.fastship.repository;

import com.fastship.entity.PartnerShipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerShipmentRepository extends JpaRepository<PartnerShipment, String> {
}
