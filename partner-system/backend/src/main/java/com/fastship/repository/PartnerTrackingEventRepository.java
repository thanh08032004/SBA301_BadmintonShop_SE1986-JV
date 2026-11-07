package com.fastship.repository;

import com.fastship.entity.PartnerTrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerTrackingEventRepository extends JpaRepository<PartnerTrackingEvent, Long> {
}
